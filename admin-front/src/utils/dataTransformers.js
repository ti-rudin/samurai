// Вспомогательные функции для преобразования данных из Strapi 5

/**
 * Преобразует данные клиента из формата Strapi
 */
export function transformClientData(clientData) {
  if (!clientData) return {};
  
  if (clientData.data) {
    const data = clientData.data.attributes || clientData.data;
    return {
      id: clientData.data.id,
      name: data.name || 'Не указан',
      phone: data.phone || 'Не указан'
    };
  }
  
  return {
    id: clientData.id,
    name: clientData.name || 'Не указан',
    phone: clientData.phone || 'Не указан'
  };
}

/**
 * Преобразует данные автомобиля из формата Strapi
 */
export function transformCarData(carData) {
  if (!carData) return {};
  
  if (carData.data) {
    const data = carData.data.attributes || carData.data;
    return {
      id: carData.data.id,
      make: data.make || 'Не указана',
      model: data.model || '',
      year: data.year || '',
      licensePlate: data.licensePlate || '-',
      vin: data.vin || ''
    };
  }
  
  return {
    id: carData.id,
    make: carData.make || 'Не указана',
    model: carData.model || '',
    year: carData.year || '',
    licensePlate: carData.licensePlate || '-',
    vin: carData.vin || ''
  };
}

/**
 * Преобразует данные работы из формата Strapi
 */
export function transformWorkData(work) {
  const workData = work.attributes || work;
  //console.log(`[transformWorkData] Processing work ${work.id}, executor field:`, workData.executor);

  let executor = [];
  if (workData.executor?.data) {
   // console.log(`[transformWorkData] work ${work.id} has executor.data:`, workData.executor.data);
    if (Array.isArray(workData.executor.data)) {
      executor = workData.executor.data.map(exec => ({
        id: exec.id,
        ...(exec.attributes || {})
      }));
    } else {
      executor = [{
        id: workData.executor.data.id,
        ...(workData.executor.data.attributes || {})
      }];
    }
  } else if (workData.executor) {
    //console.log(`[transformWorkData] work ${work.id} has executor (no .data):`, workData.executor);
    if (Array.isArray(workData.executor)) {
      executor = workData.executor.map(exec => ({
        id: exec.id,
        username: exec.username || `Исполнитель #${exec.id}`
      }));
    } else {
      executor = [{
        id: workData.executor.id,
        username: workData.executor.username || `Исполнитель #${workData.executor.id}`
      }];
    }
  } else {
   //console.log(`[transformWorkData] work ${work.id} has no executor field`);
  }

  //console.log(`[transformWorkData] work ${work.id} final executor:`, executor);

  // Обработка executorPays
  let executorPays = [];
  if (workData.executorPays) {
    try {
      if (typeof workData.executorPays === 'string') {
        executorPays = JSON.parse(workData.executorPays);
      } else if (Array.isArray(workData.executorPays)) {
        executorPays = workData.executorPays;
      }
    } catch (error) {
      console.error('[transformWorkData] Error parsing executorPays:', error);
      executorPays = [];
    }
  }

  return {
    id: work.id,
    name: workData.name || '',
    description: workData.description || '',
    cost: workData.cost || 0,
    status_of_work: workData.status_of_work || 'pending',
    executor: executor,
    executorPercentage: workData.executorPercentage || null,
    executorPays: executorPays,
    isRecomended: workData.isRecomended || false
  };
}

/**
 * Преобразует данные запчасти из формата Strapi
 */
export function transformPartData(part) {
  const partData = part.attributes || part;
  
  return {
    id: part.id,
    number: partData.number || '',
    name: partData.name || '',
    quantity: partData.quantity || 1,
    price: partData.price || 0,
    partstatus: partData.partstatus || 'pending_from_client',
    isRecomended: partData.isRecomended || false
  };
}

/**
 * Преобразует массив данных из формата Strapi
 */
export function transformArrayData(arrayData, transformer) {
  if (!arrayData) return [];
  
  if (arrayData.data) {
    return arrayData.data.map(item => transformer(item));
  }
  
  if (Array.isArray(arrayData)) {
    return arrayData.map(item => transformer(item));
  }
  
  return [];
}

/**
 * Основная функция преобразования данных заказа
 */
export function transformOrderData(item) {
  const data = item.data ? item.data : item;
  const attributes = data.attributes || data;

  const client = transformClientData(attributes.client);
  const car = transformCarData(attributes.car);
  const works = transformArrayData(attributes.works, transformWorkData);
  const parts = transformArrayData(attributes.parts, transformPartData);

  return {
    id: data.id,
    documentId: attributes.documentId || data.documentId || '',
    clientId: client.id || null,
    carId: car.id || null,
    orderstatus: attributes.orderstatus || data.orderstatus || 'new',
    description: attributes.description || data.description || '',
    estimatedCost: attributes.estimatedCost || data.estimatedCost || 0,
    finalCost: attributes.finalCost || data.finalCost || 0,
    notes: attributes.notes || data.notes || '',
    createdAt: attributes.createdAt || data.createdAt || new Date().toISOString(),
    works: works,
    parts: parts,
    client: client,
    car: car
  };
}
