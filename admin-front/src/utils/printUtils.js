import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import config from '../config.js';

// --- Общие утилиты ---
const removeElementsBySelector = (container, selectors) => {
  selectors.forEach(selector => {
    container.querySelectorAll(selector).forEach(el => el.remove());
  });
};

const removeElementsByText = (container, texts, options = {}) => {
  const { tag = 'div', exact = false } = options;
  container.querySelectorAll(tag).forEach(el => {
    const content = el.textContent?.trim().toLowerCase() || '';
    if (texts.some(text => exact ? content === text : content.includes(text))) {
      el.remove();
    }
  });
};

const removeColumnsByHeaderText = (table, texts) => {
  const headers = Array.from(table.querySelectorAll('th'));
  headers.forEach((header, index) => {
    const text = (header.textContent || '').trim().toLowerCase();
    if (texts.some(t => text.includes(t))) {
      table.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells[index]) cells[index].remove();
      });
    }
  });
};

const applyTableStyles = (table, isPDF) => {
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.tableLayout = 'fixed';
  table.querySelectorAll('th, td').forEach(cell => {
    cell.style.border = isPDF ? '1px solid #000' : '1px solid #e5e7eb';
    cell.style.padding = '6px 8px';
    cell.style.verticalAlign = 'top';
    cell.style.whiteSpace = 'normal';
    cell.style.wordBreak = 'break-word';
    cell.style.overflowWrap = 'anywhere';
    cell.style.overflow = 'visible';
    cell.style.textOverflow = 'clip';
    if (!cell.style.lineHeight) cell.style.lineHeight = '1.4';
  });
};

// --- Основные функции ---
export function prepareOrderContainerForPrint(container, { isPDF = false } = {}) {
  const clone = container.cloneNode(true);
  const host = document.createElement('div');
  host.id = 'pdf-render-root';
  host.setAttribute('aria-hidden', 'true');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.zIndex = '-1';

  if (isPDF) {
    const shadow = host.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.style.width = '794px';
    wrapper.style.maxWidth = '794px';
    wrapper.style.margin = '0';
    wrapper.style.padding = '0';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.color = 'black';
    shadow.appendChild(wrapper);
    wrapper.appendChild(clone);
  } else {
    host.style.width = '210mm';
    host.appendChild(clone);
  }

  document.body.appendChild(host);
  return { clone, host };
}

export function removeInteractiveElements(container) {
  removeElementsBySelector(container, [
    'button',
    'input[type="checkbox"]',
    'span[class*="bg-yellow-"]',
    'span[class*="bg-blue-"]',
    'span[class*="bg-green-"]',
    'span[class*="bg-purple-"]',
  ]);
}

export function removeUnnecessarySections(container) {
  removeElementsByText(container, ['описание работ', 'статус заказа', 'выбрано'], { tag: 'div' });
  removeExecutorInfo(container);
  removeRecommendedSections(container);
  removeActionsSection(container);
}

function removeExecutorInfo(container) {
  container.querySelectorAll('div').forEach(div => {
    if (div.textContent?.includes('Исполнитель:')) {
      div.remove();
    }
  });
  container.querySelectorAll('th').forEach(header => {
    if (header.textContent?.includes('Исполнитель')) {
      const table = header.closest('table');
      if (table) {
        const headerIndex = Array.from(header.parentNode.children).indexOf(header);
        table.querySelectorAll('tr').forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells[headerIndex]) cells[headerIndex].remove();
        });
      }
    }
  });
}

function removeRecommendedSections(container) {
  container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    const text = heading.textContent?.trim().toLowerCase() || '';
    if (text.includes('рекомендуемые') || text.includes('запчаст')) {
      let parent = heading.parentElement;
      while (parent && parent !== container) {
        if (parent.classList?.contains('section') ||
            parent.classList?.contains('mb-6') ||
            parent.classList?.contains('p-4') ||
            parent.tagName === 'SECTION') {
          parent.remove();
          break;
        }
        parent = parent.parentElement;
      }
    }
  });
}

function removeActionsSection(container) {
  container.querySelectorAll('h2').forEach(heading => {
    const text = heading.textContent?.trim().toLowerCase() || '';
    if (text.includes('действия')) {
      let parent = heading.parentElement;
      while (parent && parent !== container) {
        if (parent.classList?.contains('bg-white') ||
            parent.classList?.contains('shadow-md') ||
            parent.classList?.contains('rounded-lg') ||
            parent.classList?.contains('p-6')) {
          parent.remove();
          break;
        }
        parent = parent.parentElement;
      }
    }
  });
}

export function normalizeTables(container, { isPDF = false } = {}) {
  container.querySelectorAll('table').forEach(table => {
    applyTableStyles(table, isPDF);
    removeColumnsByHeaderText(table, ['действ', 'статус']);
    removeEmptyColumns(table);
  });
  normalizeWorksTables(container);
}

function removeEmptyColumns(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  const colCount = Math.max(...rows.map(r => r.querySelectorAll('td, th').length));
  for (let col = colCount - 1; col >= 0; col--) {
    let allEmpty = true;
    for (const row of rows) {
      const cells = row.querySelectorAll('td, th');
      const cell = cells[col];
      if (!cell) continue;
      const hasContent = (cell.textContent?.trim().length > 0) ||
                         cell.querySelector('input,button,svg,img,textarea,select,a');
      if (hasContent) {
        allEmpty = false;
        break;
      }
    }
    if (allEmpty) {
      rows.forEach(r => {
        const cells = r.querySelectorAll('td, th');
        if (cells[col]) cells[col].remove();
      });
    }
  }
}

function normalizeWorksTables(container) {
  container.querySelectorAll('table').forEach(table => {
    const headers = Array.from(table.querySelectorAll('thead th, tr:first-child th'));
    const titles = headers.map(th => (th.textContent || '').trim().toLowerCase());
    if (titles.includes('название') && titles.includes('описание') && titles.includes('стоимость')) {
      const keepColumns = [];
      headers.forEach((header, index) => {
        const text = (header.textContent || '').trim().toLowerCase();
        if (text.includes('название') || text.includes('описание') || text.includes('стоимость')) {
          keepColumns.push(index);
        }
      });
      table.querySelectorAll('tr').forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        for (let i = cells.length - 1; i >= 0; i--) {
          if (!keepColumns.includes(i)) cells[i].remove();
        }
      });
    }
  });
}

export function applyPrintStyles(container, { isPDF = false, width = '375px' } = {}) {
  container.style.width = width;
  container.style.maxWidth = '100%';
  container.style.margin = '0 auto';
  container.style.padding = '16px';
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = isPDF ? 'white' : 'black';

  container.querySelectorAll('*').forEach(el => {
    el.style.overflow = 'visible';
    el.style.textOverflow = 'clip';
    el.style.whiteSpace = 'normal';
    el.style.wordBreak = 'break-word';
    el.style.overflowWrap = 'anywhere';
    el.style.maxHeight = 'none';
    if (!el.style.lineHeight) el.style.lineHeight = '1.4';
  });

  container.querySelectorAll('.p-5, .p-4').forEach(card => {
    card.style.background = isPDF ? 'white' : '#f9fafb';
    card.style.border = isPDF ? 'none' : '1px solid #e5e7eb';
    card.style.borderRadius = isPDF ? '0' : '8px';
    card.style.padding = isPDF ? '0' : '12px';
    card.style.marginBottom = isPDF ? '12px' : '10px';
    card.style.boxShadow = 'none';
  });

  processWorkAndPartSections(container, isPDF);
  replaceTextareas(container, isPDF);
  if (isPDF) applyPDFSpecificStyles(container);
}

function processWorkAndPartSections(container, isPDF) {
  container.querySelectorAll('.hidden.md\\:block').forEach(el => {
    el.style.display = isPDF ? 'block' : 'none';
  });
  container.querySelectorAll('.md\\:hidden').forEach(el => {
    el.style.display = isPDF ? 'none' : 'block';
  });
}

function replaceTextareas(container, isPDF) {
  container.querySelectorAll('textarea').forEach(textarea => {
    const div = document.createElement('div');
    div.textContent = textarea.value;
    div.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid ${isPDF ? '#000' : '#4b5563'};
      border-radius: ${isPDF ? '0' : '4px'};
      background: ${isPDF ? 'white' : '#374151'};
      color: ${isPDF ? 'black' : '#f3f4f6'};
      font-size: 14px;
      line-height: 1.5;
      min-height: 80px;
    `;
    textarea.parentNode.replaceChild(div, textarea);
  });
}

function applyPDFSpecificStyles(container) {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @page {
      margin: 40px 30px 30px 30px;
      size: A4;
    }
    body {
      font-family: Arial, sans-serif;
      orphans: 3;
      widows: 3;
    }
    * {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 10px !important;
    }
    thead {
      display: table-header-group !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    tbody {
      display: table-row-group !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    th, td {
      border: 1px solid black !important;
      padding: 8px !important;
      vertical-align: top !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 3;
      widows: 3;
    }
    .totals-container, .recommended-totals-container {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-before: avoid !important;
      break-before: avoid !important;
      margin-top: 20px !important;
      margin-bottom: 20px !important;
    }
    .page-break {
      page-break-after: always;
    }
    hr {
      border: 0 !important;
      border-top: 1px solid #000 !important;
      margin: 12px 0 !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .recommended-section {
      page-break-before: always !important;
      break-before: always !important;
    }
    div, p, span {
      orphans: 3;
      widows: 3;
    }
  `;
  const host = container.parentNode?.parentNode;
  if (host?.shadowRoot) {
    host.shadowRoot.appendChild(styleEl);
  } else {
    document.head.appendChild(styleEl);
  }
}


export function addDocumentHeader(container, isPDF = false) {
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';
  if (isPDF) {
    header.style.borderBottom = '1px solid #000';
    header.style.paddingBottom = '10px';
  }
  const title = document.createElement('div');
  title.textContent = 'САМУРАЙ Автоклуб Тверь';
  title.style.fontSize = isPDF ? '20px' : '18px';
  title.style.fontWeight = isPDF ? 'bold' : 'normal';
  title.style.marginBottom = isPDF ? '0' : '14px';
  title.style.color = isPDF ? 'black' : 'inherit';
  header.appendChild(title);
  container.insertBefore(header, container.firstChild);
}

export function cleanupAfterGeneration(host) {
  if (host?.parentNode) host.parentNode.removeChild(host);
}

export function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType });
}

export async function generateOrderPNG(orderData, { notifyInfo, notifySuccess, notifyError, uploadImage }) {
  try {
    notifyInfo('Подготовка документа для печати...');
    if (!orderData?.id) {
      notifyError('Данные заказа не загружены');
      return;
    }
    const orderContainer = document.querySelector('.container.mx-auto.p-4');
    if (!orderContainer) {
      notifyError('Не удалось найти контейнер заказ-наряда');
      return;
    }
    const { clone, host } = prepareOrderContainerForPrint(orderContainer, { isPDF: false });
    removeInteractiveElements(clone);
    removeUnnecessarySections(clone);
    normalizeTables(clone, { isPDF: false });
    applyPrintStyles(clone, { isPDF: false, width: '375px' });
    addDocumentHeader(clone, false);
    await new Promise(resolve => setTimeout(resolve, 100));
    clone.style.fontFamily = 'Arial, sans-serif';
    await new Promise(resolve => setTimeout(resolve, 200));
    const canvas = await html2canvas(clone, {
      backgroundColor: null,
      scale: 2,
      width: 375,
      height: clone.scrollHeight,
      logging: false,
      useCORS: true,
      allowTaint: true,
      removeContainer: false,
    });
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    cleanupAfterGeneration(host);
    notifyInfo('Загрузка изображения в систему...');
    const base64Data = dataUrl.split(',')[1];
    const blob = b64toBlob(base64Data, 'image/png');
    const filename = `zakaz_naryad_${orderData.id}_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}_${Date.now().toString().slice(-8)}`;
    const fileName = `${filename}.png`;

    // Создаем файл с правильным именем и проверяем blob
    console.log('Blob size:', blob.size, 'Blob type:', blob.type);
    const file = new File([blob], fileName, { type: 'image/png' });
    console.log('File created:', file.name, file.size, file.type);
    try {
      const strapiImageUrl = await uploadImage(file);
      const urlParts = strapiImageUrl.split('/');
      const filenameWithHash = urlParts[urlParts.length - 1];
      const hash = filenameWithHash.split('_').slice(-1)[0].split('.')[0];
      const mainDomainUrl = `${config.MAIN_URL}/uploads/${filename}/?hash=${hash}`;
      document.cookie = `order_image_${filename}=${encodeURIComponent(strapiImageUrl)}; path=/; max-age=86400`;
      return {
        success: true,
        imageUrl: mainDomainUrl,
        message: 'Изображение успешно загружено! Ссылка доступна для копирования.',
      };
    } catch (uploadError) {
      console.error('Ошибка при загрузке в Strapi:', uploadError);
      notifyError('Не удалось загрузить изображение в систему');
      const link = document.createElement('a');
      link.download = `заказ-наряд-${orderData.id}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      notifySuccess('Документ успешно сохранен локально!');
      return { success: false, fallback: true };
    }
  } catch (error) {
    console.error('Ошибка при генерации PNG:', error);
    notifyError('Произошла ошибка при создании изображения');
    return { success: false, error };
  }
}

// --- Генерация PDF ---
function createTableWithTitle(container, titleText, headers, rows, isParts = false) {
  if (!rows.length) return 0;

  const tableTitle = document.createElement('h3');
  tableTitle.textContent = titleText;
  tableTitle.className = 'table-title';
  tableTitle.style.marginBottom = '10px';
  tableTitle.style.fontSize = '16px';
  tableTitle.style.fontWeight = 'bold';
  tableTitle.style.pageBreakAfter = 'avoid';
  tableTitle.style.breakAfter = 'avoid';
  container.appendChild(tableTitle);

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '20px';
  table.style.border = '1px solid black';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header.text;
    th.style.border = '1px solid black';
    th.style.padding = '8px';
    th.style.backgroundColor = '#f5f5f5';
    th.style.fontWeight = 'bold';
    th.style.textAlign = header.align || 'left';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(rowData => {
    const row = document.createElement('tr');
    rowData.forEach(cellData => {
      const cell = document.createElement('td');
      cell.style.border = '1px solid black';
      cell.style.padding = '8px';
      cell.style.textAlign = cellData.align || 'left';

      if (typeof cellData.value === 'string' && cellData.value.includes('\n')) {
        const lines = cellData.value.split('\n');
        cell.innerHTML = lines.map(line => `<div style="margin-bottom: 4px;">${line}</div>`).join('');
      } else {
        cell.textContent = String(cellData.value);
      }

      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  // Подсчёт суммы по таблице
  const tableTotal = rows.reduce((sum, rowData) => {
    const costCell = rowData[rowData.length - 1];
    let costText = costCell.value;
    costText = costText.replace(/[^\d,]/g, '').replace(',', '.');
    const cost = parseFloat(costText) || 0;
    return sum + cost;
  }, 0);

  return tableTotal;
}

function generateDocumentPage(orderData, options = {}) {
  const {
    title = 'Документ',
    includeRecommended = false,
    works = [],
    parts = [],
    recommendedWorks = [],
    recommendedParts = []
  } = options;

  const container = document.createElement('div');
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.padding = '40px 30px 30px 30px';
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = 'white';
  container.style.color = 'black';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.position = 'relative';

  const titleElement = document.createElement('h1');
  titleElement.textContent = title;
  titleElement.style.fontSize = '24px';
  titleElement.style.marginBottom = '10px';
  titleElement.style.textAlign = 'center';
  titleElement.style.fontWeight = 'bold';
  container.appendChild(titleElement);

  const dateDiv = document.createElement('div');
  dateDiv.textContent = `от ${new Date(orderData.createdAt).toLocaleDateString('ru-RU')}`;
  dateDiv.style.fontSize = '16px';
  dateDiv.style.marginBottom = '20px';
  dateDiv.style.textAlign = 'center';
  container.appendChild(dateDiv);

  if (orderData.client || orderData.car) {
    const clientInfo = document.createElement('div');
    clientInfo.style.marginBottom = '20px';
    clientInfo.style.padding = '10px';
    clientInfo.style.border = '1px solid #ccc';
    clientInfo.style.borderRadius = '4px';
    if (orderData.client) {
      const clientName = document.createElement('div');
      clientName.textContent = `Клиент: ${orderData.client.name || 'Не указан'}`;
      clientName.style.fontWeight = 'bold';
      clientName.style.marginBottom = '5px';
      clientInfo.appendChild(clientName);
    }
    if (orderData.car) {
      const carInfo = document.createElement('div');
      carInfo.textContent = `Автомобиль: ${orderData.car.brand || ''} ${orderData.car.model || ''} ${orderData.car.year || ''}`.trim();
      carInfo.style.marginBottom = '5px';
      clientInfo.appendChild(carInfo);
      if (orderData.car.vin) {
        const vinInfo = document.createElement('div');
        vinInfo.textContent = `VIN: ${orderData.car.vin}`;
        clientInfo.appendChild(vinInfo);
      }
    }
    container.appendChild(clientInfo);
  }

  let worksTotal = 0;
  let partsTotal = 0;
  let itemNumber = 1;

  // Основные работы
  const worksRows = works.map(work => {
    const cost = parseFloat(work.cost) || 0;
    if (cost <= 0) return null;
    worksTotal += cost;
    return [
      { value: itemNumber++, align: 'center' },
      { value: `${work.name || 'Работа'}\n${work.description || ''}`, align: 'left' },
      { value: cost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }), align: 'right' },
    ];
  }).filter(Boolean);

  if (worksRows.length > 0) {
    createTableWithTitle(container, 'Работы', [
      { text: '№', align: 'center' },
      { text: 'Наименование', align: 'left' },
      { text: 'Сумма', align: 'right' },
    ], worksRows);
  }

  // Основные запчасти
  const partsRows = parts.map(part => {
    const price = parseFloat(part.price) || 0;
    const quantity = parseFloat(part.quantity) || 1;
    const cost = price * quantity;
    if (cost <= 0) return null;
    partsTotal += cost;
    return [
      { value: itemNumber++, align: 'center' },
      { value: `${part.number || ''}-${part.name || 'Запчасть'}`.trim(), align: 'left' },
      { value: quantity.toString(), align: 'center' },
      { value: 'шт.', align: 'center' },
      { value: price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }), align: 'right' },
      { value: cost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }), align: 'right' },
    ];
  }).filter(Boolean);

  if (partsRows.length > 0) {
    createTableWithTitle(container, 'Запчасти', [
      { text: '№', align: 'center' },
      { text: 'Наименование', align: 'left' },
      { text: 'Кол-во', align: 'center' },
      { text: 'Ед. изм.', align: 'center' },
      { text: 'Цена', align: 'right' },
      { text: 'Сумма', align: 'right' },
    ], partsRows, true);
  }

  // Итоговые суммы (основные работы и запчасти)
  const grandTotal = worksTotal + partsTotal;

  if (grandTotal > 0) {
    const totalsContainer = document.createElement('div');
    totalsContainer.className = 'totals-container';
    totalsContainer.style.marginTop = '20px';
    totalsContainer.style.padding = '10px';
    totalsContainer.style.border = '1px solid #000';
    totalsContainer.style.backgroundColor = '#f9f9f9';
    totalsContainer.style.fontWeight = 'bold';
    totalsContainer.style.fontSize = '16px';
    totalsContainer.style.textAlign = 'right';
    totalsContainer.style.pageBreakInside = 'avoid';
    totalsContainer.style.breakInside = 'avoid';

    if (worksTotal > 0) {
      const worksTotalDiv = document.createElement('div');
      worksTotalDiv.textContent = `Сумма по работам: ${worksTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}`;
      worksTotalDiv.style.marginBottom = '5px';
      totalsContainer.appendChild(worksTotalDiv);
    }

    if (partsTotal > 0) {
      const partsTotalDiv = document.createElement('div');
      partsTotalDiv.textContent = `Сумма по запчастям: ${partsTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}`;
      partsTotalDiv.style.marginBottom = '5px';
      totalsContainer.appendChild(partsTotalDiv);
    }

    const grandTotalDiv = document.createElement('div');
    grandTotalDiv.textContent = `ИТОГО: ${grandTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}`;
    grandTotalDiv.style.fontSize = '18px';
    grandTotalDiv.style.fontWeight = 'bold';
    grandTotalDiv.style.marginTop = '10px';
    totalsContainer.appendChild(grandTotalDiv);

    container.appendChild(totalsContainer);
  }

  // Рекомендуемые работы и запчасти (только для акта)
  if (includeRecommended) {
    let recommendedWorksTotal = 0;
    let recommendedPartsTotal = 0;
    let recommendedItemNumber = 1;

    // Разделительная линия перед рекомендуемыми работами
    const separator = document.createElement('hr');
    separator.style.margin = '30px 0';
    separator.style.border = 'none';
    separator.style.borderTop = '1px dashed #ccc';
    container.appendChild(separator);

 

    // Рекомендуемые работы
    if (recommendedWorks.length > 0) {
      const recommendedWorksRows = recommendedWorks.map(work => {
        const cost = parseFloat(work.cost) || 0;
        recommendedWorksTotal += cost;
        return [
          { value: recommendedItemNumber++, align: 'center' },
          { value: `${work.name || 'Работа'}\n${work.description || ''}`, align: 'left' },
          { value: cost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }), align: 'right' },
        ];
      });

      if (recommendedWorksRows.length > 0) {
        createTableWithTitle(container, 'Рекомендуемые работы', [
          { text: '№', align: 'center' },
          { text: 'Наименование', align: 'left' },
          { text: 'Сумма', align: 'right' },
        ], recommendedWorksRows);
      }
    }

    // Рекомендуемые запчасти
    if (recommendedParts.length > 0) {
      const recommendedPartsRows = recommendedParts.map(part => {
        const price = parseFloat(part.price) || 0;
        const quantity = parseFloat(part.quantity) || 1;
        const cost = price * quantity;
        recommendedPartsTotal += cost;
        return [
          { value: recommendedItemNumber++, align: 'center' },
          { value: `${part.number || ''}-${part.name || 'Запчасть'}`.trim(), align: 'left' },
          { value: quantity.toString(), align: 'center' },
          { value: 'шт.', align: 'center' },
          { value: price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }), align: 'right' },
          { value: cost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }), align: 'right' },
        ];
      });

      if (recommendedPartsRows.length > 0) {
        createTableWithTitle(container, 'Рекомендуемые запчасти', [
          { text: '№', align: 'center' },
          { text: 'Наименование', align: 'left' },
          { text: 'Кол-во', align: 'center' },
          { text: 'Ед. изм.', align: 'center' },
          { text: 'Цена', align: 'right' },
          { text: 'Сумма', align: 'right' },
        ], recommendedPartsRows, true);
      }
    }

    // Итоговые суммы по рекомендуемым работам и запчастям
    const recommendedTotal = recommendedWorksTotal + recommendedPartsTotal;
    if (recommendedTotal > 0) {
      const recommendedTotalsContainer = document.createElement('div');
      recommendedTotalsContainer.className = 'recommended-totals-container';
      recommendedTotalsContainer.style.marginTop = '20px';
      recommendedTotalsContainer.style.padding = '10px';
      recommendedTotalsContainer.style.border = '1px solid #000';
      recommendedTotalsContainer.style.backgroundColor = '#f9f9f9';
      recommendedTotalsContainer.style.fontWeight = 'bold';
      recommendedTotalsContainer.style.fontSize = '16px';
      recommendedTotalsContainer.style.textAlign = 'right';
      recommendedTotalsContainer.style.pageBreakInside = 'avoid';
      recommendedTotalsContainer.style.breakInside = 'avoid';

      if (recommendedWorksTotal > 0) {
        const recommendedWorksTotalDiv = document.createElement('div');
        recommendedWorksTotalDiv.textContent = `Сумма по рекомендуемым работам: ${recommendedWorksTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}`;
        recommendedWorksTotalDiv.style.marginBottom = '5px';
        recommendedTotalsContainer.appendChild(recommendedWorksTotalDiv);
      }

      if (recommendedPartsTotal > 0) {
        const recommendedPartsTotalDiv = document.createElement('div');
        recommendedPartsTotalDiv.textContent = `Сумма по рекомендуемым запчастям: ${recommendedPartsTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}`;
        recommendedPartsTotalDiv.style.marginBottom = '5px';
        recommendedTotalsContainer.appendChild(recommendedPartsTotalDiv);
      }

      const recommendedGrandTotalDiv = document.createElement('div');
      recommendedGrandTotalDiv.textContent = `ИТОГО по рекомендациям: ${recommendedTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}`;
      recommendedGrandTotalDiv.style.fontSize = '16px';
      recommendedGrandTotalDiv.style.fontWeight = 'bold';
      recommendedGrandTotalDiv.style.marginTop = '10px';
      recommendedTotalsContainer.appendChild(recommendedGrandTotalDiv);

      container.appendChild(recommendedTotalsContainer);
    }
  }

  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @page {
      margin: 40px 30px 30px 30px;
      size: A4;
    }
    table {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 10px;
      border-collapse: collapse;
      width: 100%;
    }
    thead {
      display: table-header-group;
    }
    tbody {
      display: table-row-group;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border: 1px solid black;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .page-break {
      page-break-after: always;
    }
  `;
  container.appendChild(styleElement);

  const bottomMargin = document.createElement('div');
  bottomMargin.style.height = '28px';
  container.appendChild(bottomMargin);

  return container;
}

async function generateDocumentPDF(orderData, options = {}) {
  try {
    if (!orderData?.id) return { success: false, error: 'Данные заказа не загружены' };
    const documentContainer = generateDocumentPage(orderData, options);
    document.body.appendChild(documentContainer);
    const canvas = await html2canvas(documentContainer, {
      backgroundColor: 'white',
      scale: 2,
      width: 794,
      height: documentContainer.scrollHeight,
      logging: false,
      useCORS: true,
      allowTaint: true,
      removeContainer: false,
    });
    if (documentContainer.parentNode) documentContainer.parentNode.removeChild(documentContainer);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const filename = `akt_vypolnennykh_rabot_${orderData.id}_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}.pdf`;
    return { success: true, pdfBlob: pdf.output('blob'), filename };
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    return { success: false, error };
  }
}

export async function generateActPDF(orderData, notifySuccess, notifyError) {
  try {
    if (!orderData?.id) return { success: false, error: 'Данные заказа не загружены' };
    const result = await generateDocumentPDF(orderData, {
      title: `Акт выполненных работ по заказ-наряду #${orderData.id}`,
      includeRecommended: true,
      works: (orderData.works || []).filter(work => !work.isRecomended && (parseFloat(work.cost) || 0) > 0),
      parts: (orderData.parts || []).filter(part => !part.isRecomended && (() => {
        const price = parseFloat(part.price) || 0;
        const quantity = parseFloat(part.quantity) || 1;
        return price * quantity > 0;
      })()),
      recommendedWorks: (orderData.works || []).filter(work => work.isRecomended),
      recommendedParts: (orderData.parts || []).filter(part => part.isRecomended),
    });
    if (result.success) notifySuccess('PDF акт успешно создан!');
    else notifyError('Ошибка при генерации PDF акта');
    return result;
  } catch (error) {
    console.error('Ошибка при генерации PDF акта:', error);
    notifyError('Произошла ошибка при создании PDF акта');
    return { success: false, error };
  }
}

export async function generateInvoicePDF(orderData, { notifyInfo, notifySuccess, notifyError }) {
  try {
    if (!orderData?.id) return { success: false, error: 'Данные заказа не загружены' };
    const works = (orderData.works || []).filter(work => !work.isRecomended && (parseFloat(work.cost) || 0) > 0);
    const parts = (orderData.parts || []).filter(part => !part.isRecomended && (() => {
      const price = parseFloat(part.price) || 0;
      const quantity = parseFloat(part.quantity) || 1;
      return price * quantity > 0;
    })());
    const invoiceContainer = generateDocumentPage(orderData, {
      title: 'Счет на оплату',
      includeRecommended: false, // Для счета не включаем рекомендуемые работы и запчасти
      works,
      parts,
      recommendedWorks: [], // Пустые массивы для рекомендуемых работ и запчастей
      recommendedParts: []
    });
    document.body.appendChild(invoiceContainer);
    const canvas = await html2canvas(invoiceContainer, {
      backgroundColor: 'white',
      scale: 2,
      width: 794,
      height: invoiceContainer.scrollHeight,
      logging: false,
      useCORS: true,
      allowTaint: true,
      removeContainer: false,
    });
    if (invoiceContainer.parentNode) invoiceContainer.parentNode.removeChild(invoiceContainer);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const filename = `schet_na_oplatu_${orderData.id}_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}.pdf`;
    return { success: true, pdfBlob: pdf.output('blob'), filename };
  } catch (error) {
    console.error('Ошибка при генерации PDF счета:', error);
    return { success: false, error };
  }
}
