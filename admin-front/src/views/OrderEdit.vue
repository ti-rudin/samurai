<template>
  <div class="container mx-auto p-4">
    <!-- Индикатор загрузки -->
    <LoadingSpinner
      :show="loading"
      text="Загрузка данных заказа..."
      class="fixed inset-0 bg-gray-50 dark:bg-gray-900 bg-opacity-75 z-50"
      v-if="loading && !order.id"
    />
    
    <template v-if="order.id">
      <OrderHeader :order="order" />
      <OrderStatusManager :order="order" @status-updated="handleStatusUpdated" />

      <!-- Секция Действия -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Действия</h2>
        <div class="flex flex-wrap gap-3">
          <button @click="generateShareLink"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium flex items-center space-x-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Поделиться</span>
          </button>
          <button @click="generateActPDF"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium flex items-center space-x-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m4 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4a2 2 0 002 2z" />
            </svg>
            <span>Акт PDF</span>
          </button>
      <button @click="openInvoiceModal"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium flex items-center space-x-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Счет PDF</span>
      </button>
        </div>
      </div>

      <ClientInfoCard :client="order.client" :car="order.car" />
      <WorkDescriptionSection
        :description="order.description"
        :loading="isGeneratingWorkList"
        @update:description="updateDescription"
        @generate-work-list="generateWorkList"
      />
      <WorkSection
        :works="nonRecommendedWorks"
        :executors="executors"
        :loading="loading"
        @add-work="(workData) => handleAddWork(workData)"
        @edit-work="(workData) => handleEditWork(workData)"
        @delete-work="(workId) => handleDeleteWork(workId)"
        @batch-delete="(workIds) => handleBatchDelete(workIds)"
        @batch-assign="(data) => handleBatchAssign(data)"
      />
      <PartsSection
        :parts="parts"
        :loading="loading"
        @add-part="handleAddPart"
        @edit-part="handleEditPart"
        @delete-part="handleDeletePart"
        @batch-delete="handleBatchDeleteParts"
      />
      <RecommendationsSection
        :recommendedWorks="recommendedWorks"
        :recommendedParts="recommendedParts"
        :executors="executors"
        :loading="creatingOrderFromRecommendations"
        @add-recommended-work="handleAddRecommendedWork"
        @edit-recommended-work="handleEditRecommendedWork"
        @delete-recommended-work="handleDeleteRecommendedWork"
        @add-recommended-part="handleAddRecommendedPart"
        @edit-recommended-part="handleEditRecommendedPart"
        @delete-recommended-part="handleDeleteRecommendedPart"
        @create-order-from-recommendations="handleCreateOrderFromRecommendations"
      />
      <FinanceSection
        :mainWorksCost="mainWorksCost"
        :mainPartsCost="mainPartsCost"
        :mainTotalCost="mainTotalCost"
        :recommendedWorksCost="recommendedWorksCost"
        :recommendedPartsCost="recommendedPartsCost"
        :recommendedTotalCost="recommendedTotalCost"
      />
      <NotesSection
        :notes="order.notes"
        :notesChanged="notesChanged"
        :loading="loading"
        @update:notes="updateNotes"
        @save-notes="saveNotes"
      />


      <PartItemModal
        :show="isRecommendedPartModalOpen"
        :part="currentRecommendedPart"
        @save="onSaveRecommendedPart"
        @close="closeRecommendedPartModal"
      />

      <WorkItemModal
        :show="isRecommendedWorkModalOpen"
        :work="currentRecommendedWork"
        :executors="executors"
        @save="onSaveRecommendedWork"
        @close="closeRecommendedWorkModal"
      />

      <ShareLinkModal :isOpen="showShareLinkModal" :shareUrl="shareLinkUrl" @close="showShareLinkModal = false" />

      <PDFModal :isOpen="showInvoiceModal" :pdfData="invoicePDFData" :isGenerating="isGeneratingPDF" :status="invoicePDFStatus" @close="closeInvoiceModal" />
      <ActModal :isOpen="showActModal" :pdfData="actPDFData" :isGenerating="isGeneratingActPDF" :status="actPDFStatus" @close="closeActModal" />
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderEdit } from '../composables/useOrderEdit';
import { useNotifications } from '../composables/useNotifications';
import { generateActPDF as generateActPDFUtil, generateInvoicePDF as generateInvoicePDFUtil } from '../utils/printUtils';
import { generateShareToken } from '../utils/shareUtils';
import config from '../config.js';
import OrderHeader from '../components/OrderHeader.vue';
import OrderStatusManager from '../components/OrderStatusManager.vue';
import ClientInfoCard from '../components/ClientInfoCard.vue';
import WorkDescriptionSection from '../components/WorkDescriptionSection.vue';
import WorkSection from '../components/WorkSection.vue';
import PartsSection from '../components/PartsSection.vue';
import FinanceSection from '../components/FinanceSection.vue';
import NotesSection from '../components/NotesSection.vue';
import RecommendationsSection from '../components/RecommendationsSection.vue';
import PartItemModal from '../components/PartItemModal.vue';
import WorkItemModal from '../components/WorkItemModal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ShareLinkModal from '../components/ShareLinkModal.vue';
import PDFModal from '../components/PDFModal.vue';
import ActModal from '../components/ActModal.vue';

const route = useRoute();
const { notifyInfo, notifySuccess, notifyError } = useNotifications();
const showShareLinkModal = ref(false);
const shareLinkUrl = ref('');
const showInvoiceModal = ref(false);
const invoicePDFData = ref(null);
const isGeneratingPDF = ref(false);
const invoicePDFStatus = ref('');
const showActModal = ref(false);
const actPDFData = ref(null);
const isGeneratingActPDF = ref(false);
const actPDFStatus = ref('');

// Используем новый композабл для редактирования заказов
const {
  // Состояние
  order,
  executors,
  loading,
  isGeneratingWorkList,
  notesChanged,
  isRecommendedPartModalOpen,
  currentRecommendedPart,
  isRecommendedWorkModalOpen,
  currentRecommendedWork,
  creatingOrderFromRecommendations,

  // Вычисляемые свойства
  worksCost,
  partsCost,
  totalCost,
  mainWorksCost,
  mainPartsCost,
  mainTotalCost,
  recommendedWorksCost,
  recommendedPartsCost,
  recommendedTotalCost,
  recommendedWorks,
  nonRecommendedWorks,
  parts,
  recommendedParts,

  // Методы для работ
  handleAddWork,
  handleEditWork,
  handleDeleteWork,
  handleBatchDelete,
  handleBatchAssign,

  // Методы для запчастей
  handleAddPart,
  handleEditPart,
  handleDeletePart,
  handleBatchDeleteParts,

  // Методы для рекомендованных элементов
  handleAddRecommendedWork,
  handleEditRecommendedWork,
  handleDeleteRecommendedWork,
  handleAddRecommendedPart,
  handleEditRecommendedPart,
  handleDeleteRecommendedPart,
  onSaveRecommendedWork,
  closeRecommendedWorkModal,
  onSaveRecommendedPart,
  closeRecommendedPartModal,

  // Методы для описания и примечаний
  updateDescription,
  saveDescription,
  updateNotes,
  saveNotes,
  generateWorkList,

  // Метод для создания заказа на основании рекомендаций
  handleCreateOrderFromRecommendations,

  // Инициализация
  initializeOrder
} = useOrderEdit(route.params.id);

// Обработчик обновления статуса
const handleStatusUpdated = (updatedOrder) => {
  // Обновляем локальное состояние заказа
  order.value = { ...order.value, ...updatedOrder };
};

const generateShareLink = async () => {
  try {
    const token = await generateShareToken(order.value.id, config.SHARE_SALT);
    shareLinkUrl.value = `${config.MAIN_URL}/share/${token}`;
    showShareLinkModal.value = true;
    notifySuccess('Ссылка для поделиться сгенерирована!');
  } catch (error) {
    console.error('Ошибка при генерации ссылки:', error);
    notifyError('Не удалось сгенерировать ссылку для поделиться');
  }
};



const generateActPDF = async () => {
  showActModal.value = true;
  isGeneratingActPDF.value = true;
  actPDFStatus.value = 'Подготовка PDF документа...';

  try {
    actPDFStatus.value = 'Генерация PDF акта...';
    const result = await generateActPDFUtil(order.value, notifySuccess, notifyError);

    if (result?.success && result.pdfBlob) {
      actPDFStatus.value = 'PDF акт готов!';
      actPDFData.value = {
        blob: result.pdfBlob,
        filename: result.filename,
        orderId: order.value.id
      };
    } else {
      actPDFStatus.value = 'Ошибка при генерации PDF';
      showActModal.value = false;
    }
  } catch (error) {
    console.error('Ошибка при генерации PDF акта:', error);
    actPDFStatus.value = 'Ошибка при генерации PDF';
    showActModal.value = false;
  } finally {
    isGeneratingActPDF.value = false;
  }
};

const openInvoiceModal = async () => {
  showInvoiceModal.value = true;
  isGeneratingPDF.value = true;
  invoicePDFStatus.value = 'Подготовка PDF документа...';

  try {
    invoicePDFStatus.value = 'Генерация PDF счета...';
    const result = await generateInvoicePDFUtil(order.value, {
      notifyInfo,
      notifySuccess,
      notifyError
    });

    if (result?.success && result.pdfBlob) {
      invoicePDFStatus.value = 'PDF счет готов!';
      invoicePDFData.value = {
        blob: result.pdfBlob,
        filename: result.filename,
        orderId: order.value.id
      };
    } else {
      invoicePDFStatus.value = 'Ошибка при генерации PDF';
      showInvoiceModal.value = false;
    }
  } catch (error) {
    console.error('Ошибка при генерации PDF счета:', error);
    invoicePDFStatus.value = 'Ошибка при генерации PDF';
    showInvoiceModal.value = false;
  } finally {
    isGeneratingPDF.value = false;
  }
};

const closeInvoiceModal = () => {
  showInvoiceModal.value = false;
  invoicePDFData.value = null;
  isGeneratingPDF.value = false;
  invoicePDFStatus.value = '';
};

const closeActModal = () => {
  showActModal.value = false;
  actPDFData.value = null;
  isGeneratingActPDF.value = false;
  actPDFStatus.value = '';
};

// Инициализация при монтировании компонента
onMounted(() => {
  initializeOrder();
});
</script>
