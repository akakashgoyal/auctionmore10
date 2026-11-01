import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AuctionAsset,
  AuctionAssetCategory,
  AuctionAssetFilterParams,
  AuctionAssetPagination,
} from '../../types';
import {
  getAuctionAssets,
  createAuctionAsset,
  updateAuctionAsset,
  deleteAuctionAsset,
  changeAuctionAssetStatus,
  DEFAULT_AUCTION_ASSET_PAGINATION,
  ALL_INDIAN_STATES,
} from '../../services/api';
import {
  SCRAP_SUBCATEGORIES,
  PLANT_MACHINERY_SUBCATEGORIES,
  AUCTION_ASSET_STATUSES,
  AUCTION_PLATFORMS,
  SELLER_TYPES,
  ASSET_UNITS,
  INDIAN_BANKS_COMMON,
} from '../../data/auctionAssetCategories';
import { formatINR } from '../../utils/storage';
import { PageRoute } from '../Navbar';
import { useApi } from '../../context/ApiContext';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2,
  MapPin,
  Recycle,
  Cog,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface AuctionManagementPageProps {
  onViewAuction: (asset: AuctionAsset) => void;
  onNavigate?: (page: PageRoute, customUrl?: string) => void;
}

export const AuctionManagementPage: React.FC<AuctionManagementPageProps> = ({
  onViewAuction,
  onNavigate,
}) => {
  const { auctionAssetStats, isLoadingAuctionStats, refreshAuctionAssetStats } = useApi();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AuctionAssetCategory>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Table Data
  const [assets, setAssets] = useState<AuctionAsset[]>([]);
  const [pagination, setPagination] = useState<AuctionAssetPagination>(DEFAULT_AUCTION_ASSET_PAGINATION);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Add / Edit
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingAsset, setEditingAsset] = useState<AuctionAsset | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<AuctionAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields State
  const [formCategory, setFormCategory] = useState<AuctionAssetCategory>('Scrap');
  const [formSubType, setFormSubType] = useState<string>('Iron Scrap');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formReferenceNo, setFormReferenceNo] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'active' | 'upcoming' | 'closed'>('active');
  const [formState, setFormState] = useState<string>('Delhi');
  const [formCity, setFormCity] = useState<string>('New Delhi');
  const [formCompleteAddress, setFormCompleteAddress] = useState<string>('');
  const [formPlantAddress, setFormPlantAddress] = useState<string>('');
  const [formBankName, setFormBankName] = useState<string>('State Bank of India');
  const [formSellerName, setFormSellerName] = useState<string>('');
  const [formSellerType, setFormSellerType] = useState<string>('Public Sector Bank');
  const [formListingSource, setFormListingSource] = useState<string>('Official SARFAESI Public Notice');
  const [formAuctionPlatform, setFormAuctionPlatform] = useState<string>('e-Procurement / Bank Portal');
  const [formReservePrice, setFormReservePrice] = useState<string>('');
  const [formEmdAmount, setFormEmdAmount] = useState<string>('');
  const [formReservePriceBasis, setFormReservePriceBasis] = useState<string>('Lump Sum');
  const [formAuctionDate, setFormAuctionDate] = useState<string>('');
  const [formEmdSubmissionDate, setFormEmdSubmissionDate] = useState<string>('');
  const [formQuantity, setFormQuantity] = useState<string>('');
  const [formUnit, setFormUnit] = useState<string>('Metric Tons');
  const [formCondition, setFormCondition] = useState<string>('As is where is');
  const [formSaleBasis, setFormSaleBasis] = useState<string>('As Is Where Is & Whatever There Is Basis');
  const [formPossessionStatus, setFormPossessionStatus] = useState<string>('Physical Possession');
  const [formInspectionDetails, setFormInspectionDetails] = useState<string>('');
  const [formInternalNotes, setFormInternalNotes] = useState<string>('');

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [noticePdfFile, setNoticePdfFile] = useState<File | null>(null);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch Assets
  const fetchTableAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params: AuctionAssetFilterParams = {
        page: currentPage,
        per_page: 15,
        sort_by: 'created_at',
        sort_order: 'desc',
      };
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter as any;
      if (search.trim()) params.search = search.trim();

      const res = await getAuctionAssets(params);
      setAssets(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error('Failed to load table assets:', err);
      setNotification({ type: 'error', message: 'Failed to load auction assets.' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, categoryFilter, statusFilter, search]);

  useEffect(() => {
    fetchTableAssets();
  }, [fetchTableAssets]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode('add');
    setEditingAsset(null);
    setFormError(null);

    // Default values
    const generatedRef = `AUC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormReferenceNo(generatedRef);
    setFormCategory('Scrap');
    setFormSubType('Iron Scrap');
    setFormTitle('');
    setFormStatus('active');
    setFormState('Delhi');
    setFormCity('New Delhi');
    setFormCompleteAddress('');
    setFormPlantAddress('');
    setFormBankName('State Bank of India');
    setFormSellerName('State Bank of India');
    setFormSellerType('Public Sector Bank');
    setFormListingSource('Official SARFAESI Notice');
    setFormAuctionPlatform('e-Procurement / Bank Portal');
    setFormReservePrice('');
    setFormEmdAmount('');
    setFormReservePriceBasis('Lump Sum');
    setFormAuctionDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setFormEmdSubmissionDate(new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0]);
    setFormQuantity('');
    setFormUnit('Metric Tons');
    setFormCondition('As is where is');
    setFormSaleBasis('As Is Where Is & Whatever There Is Basis');
    setFormPossessionStatus('Physical Possession');
    setFormInspectionDetails('Prior appointment via advisory desk.');
    setFormInternalNotes('');
    setImageFile(null);
    setImagePreview(null);
    setNoticePdfFile(null);
  };

  // Open Edit Modal
  const openEditModal = (asset: AuctionAsset) => {
    setModalMode('edit');
    setEditingAsset(asset);
    setFormError(null);

    setFormReferenceNo(asset.reference_no || `AST-${asset.id}`);
    setFormCategory(asset.category === 'Plant & Machinery' ? 'Plant & Machinery' : 'Scrap');
    setFormSubType(asset.sub_type || '');
    setFormTitle(asset.title || '');
    const normStatus = (asset.status || '').toLowerCase();
    setFormStatus(normStatus === 'upcoming' ? 'upcoming' : normStatus === 'closed' ? 'closed' : 'active');
    setFormState(asset.state || 'Delhi');
    setFormCity(asset.city || 'New Delhi');
    setFormCompleteAddress(asset.complete_address || '');
    setFormPlantAddress(asset.plant_address || '');
    setFormBankName(asset.bank_name || '');
    setFormSellerName(asset.seller_name || '');
    setFormSellerType(asset.seller_type || 'Public Sector Bank');
    setFormListingSource(asset.listing_source || '');
    setFormAuctionPlatform(asset.auction_platform || 'e-Procurement / Bank Portal');
    setFormReservePrice(asset.reserve_price ? String(asset.reserve_price) : '');
    setFormEmdAmount(asset.emd_amount ? String(asset.emd_amount) : '');
    setFormReservePriceBasis(asset.reserve_price_basis || 'Lump Sum');
    setFormAuctionDate(asset.auction_date ? asset.auction_date.split('T')[0] : '');
    setFormEmdSubmissionDate(asset.emd_submission_date ? asset.emd_submission_date.split('T')[0] : '');
    setFormQuantity(asset.quantity ? String(asset.quantity) : '');
    setFormUnit(asset.unit || 'Metric Tons');
    setFormCondition(asset.condition || 'As is where is');
    setFormSaleBasis(asset.sale_basis || 'As Is Where Is & Whatever There Is Basis');
    setFormPossessionStatus(asset.possession_status || 'Physical Possession');
    setFormInspectionDetails(asset.inspection_details || '');
    setFormInternalNotes(asset.internal_notes || '');
    setImageFile(null);
    setImagePreview(asset.asset_image || null);
    setNoticePdfFile(null);
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter an auction title.');
      return;
    }
    if (!formReferenceNo.trim()) {
      setFormError('Please enter a reference number.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('reference_no', formReferenceNo.trim());
    formData.append('category', formCategory);
    formData.append('sub_type', formSubType);
    formData.append('title', formTitle.trim());
    formData.append('status', formStatus);
    formData.append('state', formState);
    formData.append('city', formCity);
    if (formCompleteAddress.trim()) formData.append('complete_address', formCompleteAddress.trim());
    if (formPlantAddress.trim()) formData.append('plant_address', formPlantAddress.trim());
    if (formBankName.trim()) formData.append('bank_name', formBankName.trim());
    if (formSellerName.trim()) formData.append('seller_name', formSellerName.trim());
    if (formSellerType.trim()) formData.append('seller_type', formSellerType.trim());
    if (formListingSource.trim()) formData.append('listing_source', formListingSource.trim());
    if (formAuctionPlatform.trim()) formData.append('auction_platform', formAuctionPlatform.trim());
    if (formReservePrice) formData.append('reserve_price', formReservePrice);
    if (formEmdAmount) formData.append('emd_amount', formEmdAmount);
    if (formReservePriceBasis.trim()) formData.append('reserve_price_basis', formReservePriceBasis.trim());
    if (formAuctionDate) formData.append('auction_date', formAuctionDate);
    if (formEmdSubmissionDate) formData.append('emd_submission_date', formEmdSubmissionDate);
    if (formQuantity) formData.append('quantity', formQuantity);
    if (formUnit.trim()) formData.append('unit', formUnit.trim());
    if (formCondition.trim()) formData.append('condition', formCondition.trim());
    if (formSaleBasis.trim()) formData.append('sale_basis', formSaleBasis.trim());
    if (formPossessionStatus.trim()) formData.append('possession_status', formPossessionStatus.trim());
    if (formInspectionDetails.trim()) formData.append('inspection_details', formInspectionDetails.trim());
    if (formInternalNotes.trim()) formData.append('internal_notes', formInternalNotes.trim());

    // File attachments
    if (imageFile) {
      formData.append('asset_image', imageFile);
    }
    if (noticePdfFile) {
      formData.append('auction_notice_pdf', noticePdfFile);
    }

    try {
      if (modalMode === 'add') {
        await createAuctionAsset(formData);
        setNotification({ type: 'success', message: 'Auction asset created successfully!' });
      } else if (modalMode === 'edit' && editingAsset) {
        await updateAuctionAsset(editingAsset.id, formData);
        setNotification({ type: 'success', message: 'Auction asset updated successfully!' });
      }

      setModalMode(null);
      fetchTableAssets();
      refreshAuctionAssetStats();
    } catch (err: any) {
      console.error('Failed to submit auction asset:', err);
      setFormError(err.message || 'Operation failed. Please check inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (asset: AuctionAsset, newStatus: 'active' | 'upcoming' | 'closed') => {
    setActionLoadingId(asset.id);
    try {
      await changeAuctionAssetStatus(asset.id, newStatus);
      setAssets((prev) =>
        prev.map((item) => (item.id === asset.id ? { ...item, status: newStatus } : item))
      );
      setNotification({
        type: 'success',
        message: `Status of ${asset.reference_no || 'asset'} changed to ${newStatus}.`,
      });
      refreshAuctionAssetStats();
    } catch (err: any) {
      console.error('Failed to change status:', err);
      setNotification({ type: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteConfirmAsset) return;
    setIsSubmitting(true);
    try {
      await deleteAuctionAsset(deleteConfirmAsset.id);
      setNotification({
        type: 'success',
        message: `Asset ${deleteConfirmAsset.reference_no} deleted successfully.`,
      });
      setDeleteConfirmAsset(null);
      fetchTableAssets();
      refreshAuctionAssetStats();
    } catch (err: any) {
      console.error('Failed to delete asset:', err);
      setNotification({ type: 'error', message: err.message || 'Failed to delete asset.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subtypes for current modal category
  const availableSubTypes = formCategory === 'Scrap' ? SCRAP_SUBCATEGORIES : PLANT_MACHINERY_SUBCATEGORIES;

  return (
    <div className="min-h-screen bg-[#FBF9F5] pb-24">
      {/* Top Header */}
      <div className="bg-[#142533] text-white pt-8 pb-10 border-b border-[#D89B30]/20">
        <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF1DE]/10 text-amber-300 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D89B30]" />
                <span>Asset Management Console · Laravel API v1</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight">
                Auction Asset Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Manage, publish, edit, and track Scrap and Plant &amp; Machinery auctions with verified institutional notices.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="px-5 py-3 rounded-xl bg-[#D89B30] hover:bg-[#C58920] text-[#142533] text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Auction Asset</span>
            </button>
          </div>

          {/* Real-time Statistics Cards (Requirement 8) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">
            {/* Scrap */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Total Scrap</span>
                <Recycle className="w-4 h-4 text-[#D89B30]" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-2">
                {isLoadingAuctionStats ? '...' : auctionAssetStats.totalScrap}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ferrous &amp; Non-Ferrous</div>
            </div>

            {/* Plant & Machinery */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Plant &amp; Machinery</span>
                <Cog className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-2">
                {isLoadingAuctionStats ? '...' : auctionAssetStats.totalPlantMachinery}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Equipment &amp; Factory Units</div>
            </div>

            {/* Active */}
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-medium">
                <span>Active Auctions</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-300 mt-2">
                {isLoadingAuctionStats ? '...' : auctionAssetStats.activeAuctions}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">Open for Bidding / EMD</div>
            </div>

            {/* Upcoming */}
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
                <span>Upcoming Auctions</span>
                <Calendar className="w-4 h-4 text-[#D89B30]" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-300 mt-2">
                {isLoadingAuctionStats ? '...' : auctionAssetStats.upcomingAuctions}
              </div>
              <div className="text-[10px] text-amber-400/80 mt-0.5">Scheduled Notices</div>
            </div>

            {/* Closed */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-4 backdrop-blur-xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Closed Auctions</span>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-300 mt-2">
                {isLoadingAuctionStats ? '...' : auctionAssetStats.closedAuctions}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Completed / Concluded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="ml-2 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Management Controls & Table */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pt-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Title, Ref No, or Location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
            >
              <option value="All">All Categories</option>
              <option value="Scrap">Scrap Only</option>
              <option value="Plant & Machinery">Plant &amp; Machinery Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                fetchTableAssets();
                refreshAuctionAssetStats();
              }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D89B30]' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Asset / Ref No.</th>
                  <th className="py-3 px-4">Category &amp; Sub Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Bank / Institution</th>
                  <th className="py-3 px-4">Reserve Price</th>
                  <th className="py-3 px-4">Auction Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Loader2 className="w-8 h-8 text-[#D89B30] animate-spin mx-auto mb-2" />
                      <span>Loading auction assets...</span>
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <div className="font-bold text-slate-700 text-sm">No Auction Assets Found</div>
                        <p className="text-xs text-slate-500 mt-1">
                          No auctions match your search or filter settings. Click "Add New Auction Asset" to create one.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assets.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Asset & Reference */}
                      <td className="py-3 px-4 max-w-[260px]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {item.asset_image ? (
                              <img
                                src={item.asset_image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                {item.category === 'Scrap' ? (
                                  <Recycle className="w-5 h-5 text-[#D89B30]" />
                                ) : (
                                  <Cog className="w-5 h-5 text-blue-500" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {item.reference_no || `AST-${item.id}`}
                            </span>
                            <div className="font-bold text-slate-800 truncate mt-1 text-xs" title={item.title}>
                              {item.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Sub Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          {item.category === 'Scrap' ? (
                            <Recycle className="w-3 h-3 text-[#D89B30]" />
                          ) : (
                            <Cog className="w-3 h-3 text-blue-500" />
                          )}
                          <span>{item.category}</span>
                        </span>
                        {item.sub_type && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.sub_type}</div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3 h-3 text-[#D89B30] shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {[item.city, item.state].filter(Boolean).join(', ') || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Bank */}
                      <td className="py-3 px-4">
                        <div className="truncate max-w-[140px] text-slate-700 font-medium" title={item.bank_name || ''}>
                          {item.bank_name || '—'}
                        </div>
                      </td>

                      {/* Reserve Price */}
                      <td className="py-3 px-4">
                        <div className="font-bold font-mono text-slate-900">
                          {item.reserve_price ? formatINR(Number(item.reserve_price)) : 'TBA'}
                        </div>
                        {item.emd_amount && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            EMD: {formatINR(Number(item.emd_amount))}
                          </div>
                        )}
                      </td>

                      {/* Auction Date */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {item.auction_date
                            ? new Date(item.auction_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'TBA'}
                        </div>
                      </td>

                      {/* Status + Quick status toggle */}
                      <td className="py-3 px-4">
                        <select
                          value={item.status}
                          disabled={actionLoadingId === item.id}
                          onChange={(e) => handleStatusChange(item, e.target.value as any)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                            item.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : item.status === 'upcoming'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>

                      {/* Action Buttons: View, Edit, Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewAuction(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#142533] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Auction Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Auction"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmAsset(item)}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Auction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {pagination.last_page > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage >= pagination.last_page || loading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Auction Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#142533] text-white rounded-t-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif">
                  {modalMode === 'add' ? 'Add New Auction Asset' : `Edit Auction Asset #${editingAsset?.id}`}
                </h2>
                <p className="text-xs text-slate-300">
                  {modalMode === 'add'
                    ? 'Publish new industrial scrap or plant & machinery auction'
                    : `Updating ${editingAsset?.reference_no} via Laravel API`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Category & Identification */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  1. Category &amp; Reference Identification
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as AuctionAssetCategory;
                        setFormCategory(newCat);
                        setFormSubType(newCat === 'Scrap' ? SCRAP_SUBCATEGORIES[0] : PLANT_MACHINERY_SUBCATEGORIES[0]);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    >
                      <option value="Scrap">Scrap</option>
                      <option value="Plant & Machinery">Plant &amp; Machinery</option>
                    </select>
                  </div>

                  {/* Sub Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sub Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formSubType}
                      onChange={(e) => setFormSubType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    >
                      {availableSubTypes.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reference Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formReferenceNo}
                      onChange={(e) => setFormReferenceNo(e.target.value)}
                      placeholder="e.g. SC-2026-001 or PM-2026-009"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Auction Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Auction of 50 MT Heavy Copper Scrap & Industrial Armature"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                  />
                </div>
              </div>

              {/* 2. Commercial Pricing & Auction Schedule */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  2. Pricing &amp; Dates
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Reserve Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reserve Price (₹)</label>
                    <input
                      type="number"
                      value={formReservePrice}
                      onChange={(e) => setFormReservePrice(e.target.value)}
                      placeholder="e.g. 2500000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* EMD Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">EMD Amount (₹)</label>
                    <input
                      type="number"
                      value={formEmdAmount}
                      onChange={(e) => setFormEmdAmount(e.target.value)}
                      placeholder="e.g. 250000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* Auction Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Auction Date</label>
                    <input
                      type="date"
                      value={formAuctionDate}
                      onChange={(e) => setFormAuctionDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* EMD Submission Deadline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">EMD Deadline</label>
                    <input
                      type="date"
                      value={formEmdSubmissionDate}
                      onChange={(e) => setFormEmdSubmissionDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Auction Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    >
                      <option value="active">Active (Open)</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Price Basis */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reserve Price Basis</label>
                    <input
                      type="text"
                      value={formReservePriceBasis}
                      onChange={(e) => setFormReservePriceBasis(e.target.value)}
                      placeholder="e.g. Lump Sum or Per MT"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* Platform */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Auction Platform</label>
                    <select
                      value={formAuctionPlatform}
                      onChange={(e) => setFormAuctionPlatform(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    >
                      {AUCTION_PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Location & Quantity */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  3. Location &amp; Physical Specifications
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <select
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    >
                      {ALL_INDIAN_STATES.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="e.g. Panipat"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    >
                      {ASSET_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Complete Address</label>
                    <textarea
                      rows={2}
                      value={formCompleteAddress}
                      onChange={(e) => setFormCompleteAddress(e.target.value)}
                      placeholder="Full street address, plot number, industrial area..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Factory / Plant Address</label>
                    <textarea
                      rows={2}
                      value={formPlantAddress}
                      onChange={(e) => setFormPlantAddress(e.target.value)}
                      placeholder="Specific plant shed or yard location..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Bank & Institution Details */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  4. Bank &amp; Institution Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formBankName}
                      onChange={(e) => setFormBankName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* Seller Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seller Name</label>
                    <input
                      type="text"
                      value={formSellerName}
                      onChange={(e) => setFormSellerName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    />
                  </div>

                  {/* Seller Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Seller Type</label>
                    <select
                      value={formSellerType}
                      onChange={(e) => setFormSellerType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                    >
                      {SELLER_TYPES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Document & Image Uploads (Requirement 6: multipart/form-data) */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  5. Upload Asset Image &amp; Notice PDF (multipart/form-data)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Asset Image Upload */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#D89B30]" />
                      <span>Asset Image (JPG/PNG/WEBP)</span>
                    </label>

                    {imagePreview && (
                      <div className="mb-3 relative w-full h-28 rounded-xl overflow-hidden bg-slate-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#142533] file:text-white hover:file:bg-[#203545] cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">High-resolution photo of machinery or scrap lot</p>
                  </div>

                  {/* Notice PDF Upload */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span>Auction Notice PDF Document</span>
                    </label>

                    {noticePdfFile ? (
                      <div className="p-2 mb-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{noticePdfFile.name}</span>
                      </div>
                    ) : editingAsset?.auction_notice_pdf ? (
                      <div className="p-2 mb-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">Current Notice PDF Attached</span>
                      </div>
                    ) : null}

                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNoticePdfFile(file);
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#142533] file:text-white hover:file:bg-[#203545] cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Official bank published public auction notification</p>
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Internal Confidential Notes (Hidden from public users)
                  </label>
                  <textarea
                    rows={2}
                    value={formInternalNotes}
                    onChange={(e) => setFormInternalNotes(e.target.value)}
                    placeholder="Private notes on seller contacts, Reserve price negotiation margins, legal dues..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D89B30]"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#142533] hover:bg-[#203545] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D89B30]" />
                      <span>Saving to Laravel API...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#D89B30]" />
                      <span>{modalMode === 'add' ? 'Publish Auction Asset' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#142533]">Delete Auction Asset?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 font-mono">
                {deleteConfirmAsset.reference_no} ({deleteConfirmAsset.title})
              </strong>
              ? This action will invoke the Laravel API <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded">DELETE /auction-assets/{deleteConfirmAsset.id}</code> and cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmAsset(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
