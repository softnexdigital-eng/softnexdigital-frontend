'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Product, Variant } from '@/types';
import {
  FiSave, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCw,
  FiDollarSign, FiGrid, FiCheck, FiMinus, FiPlus as FiPlusIcon,
  FiCopy, FiChevronDown
} from 'react-icons/fi';

// ===================== MultiSelectDropdown =====================
interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  colorImageUrls?: Record<string, string>;
  onColorImageChange?: (color: string, url: string) => void;
}

function MultiSelectDropdown({ label, options, selected, onChange, colorImageUrls, onColorImageChange }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const isColor = label.toLowerCase() === 'color';

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm bg-white cursor-pointer flex items-center justify-between hover:border-gray-300 transition-colors"
      >
        <span className="text-sm text-gray-700 truncate">
          {selected.length === 0 ? `Select ${label}` : `${selected.length} selected`}
        </span>
        <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-60 overflow-y-auto p-2">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <input
              type="checkbox"
              checked={selected.length === options.length}
              onChange={toggleAll}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Select All</label>
          </div>
          {options.map((opt) => (
            <div key={opt} className={isColor ? 'flex flex-col gap-1' : ''}>
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                />
                <span className="text-sm text-gray-700 flex-shrink-0">{opt}</span>
                {selected.includes(opt) && onColorImageChange && (
                  <input
                    type="text"
                    value={colorImageUrls?.[opt] || ''}
                    onChange={(e) => { e.stopPropagation(); onColorImageChange(opt, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 px-2 py-1 text-xs border border-blue-300 rounded outline-none focus:border-blue-500 bg-blue-50"
                    placeholder="https://example.com/image.jpg"
                  />
                )}
                {selected.includes(opt) && !onColorImageChange && <FiCheck className="ml-auto text-blue-600 w-4 h-4 flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================== Main Component =====================
interface AttributeTemplate {
  id: string;
  name: string;
  type: string;
  options: string[];
}

interface VariantWithArrayAttrs extends Variant {
  attributes: Record<string, string | string[]>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<VariantWithArrayAttrs[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit product info
  const [editingInfo, setEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Attribute templates
  const [attributeTemplates, setAttributeTemplates] = useState<AttributeTemplate[]>([]);

  // ----- Variant Form -----
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantWithArrayAttrs | null>(null);
  const [vSku, setVSku] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vCompare, setVCompare] = useState('');
  const [vCost, setVCost] = useState('');
  const [vStock, setVStock] = useState('');
  const [vImage, setVImage] = useState('');

  // Variant image manager
  const [managingVariantId, setManagingVariantId] = useState<string | null>(null);
  const [variantImages, setVariantImages] = useState<Array<{ id: string; url: string; altText: string; color?: string; isPrimary: boolean; sortOrder: number }>>([]);
  const [newVariantImageUrl, setNewVariantImageUrl] = useState('');
  const [savingVariantImage, setSavingVariantImage] = useState(false);

  // Which attributes are selected for this variant (enabled)
  const [selectedAttrNames, setSelectedAttrNames] = useState<Set<string>>(new Set());
  // Values for each selected attribute (array of strings)
  const [vAttributes, setVAttributes] = useState<Record<string, string[]>>({});
  // Image URLs for each Color value (maps color name -> image URL)
  const [colorImageUrls, setColorImageUrls] = useState<Record<string, string>>({});

  // Bulk generation
  const [bulkShow, setBulkShow] = useState(false);
  const [bulkBasePrice, setBulkBasePrice] = useState('');
  const [bulkSkuPrefix, setBulkSkuPrefix] = useState('');
  const [generating, setGenerating] = useState(false);

  // Bulk edit
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkNewPrice, setBulkNewPrice] = useState('');
  const [bulkNewStock, setBulkNewStock] = useState('');

  // ====== Data Fetching ======
  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/product/${productId}`);
      if (res.data.success) {
        setProduct(res.data.data);
        setEditName(res.data.data.name || '');
        setEditDesc(res.data.data.description || '');
        setEditPrice(res.data.data.basePrice ? String(res.data.data.basePrice) : '');
      }
    } catch {
      showToast.error('Failed to load product');
      router.push('/dashboard/product');
    }
  }, [productId, router]);

  const fetchVariants = useCallback(async () => {
    try {
      const res = await api.get(`/variants?productId=${productId}`);
      if (res.data.success) {
        const parsed = res.data.data.map((v: any) => {
          const attrs = v.attributes || {};
          const parsedAttrs: Record<string, string | string[]> = {};
          Object.entries(attrs).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
              try {
                parsedAttrs[key] = JSON.parse(value);
              } catch {
                parsedAttrs[key] = value;
              }
            } else if (typeof value === 'string' && value.includes(',')) {
              parsedAttrs[key] = value.split(',').map(s => s.trim());
            } else {
              parsedAttrs[key] = value as string;
            }
          });
          return { ...v, attributes: parsedAttrs };
        });
        setVariants(parsed as VariantWithArrayAttrs[]);
      }
    } catch {}
  }, [productId]);

  const fetchAttributeTemplates = useCallback(async () => {
    try {
      const res = await api.get('/attribute-templates');
      if (res.data.success) setAttributeTemplates(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProduct(), fetchVariants(), fetchAttributeTemplates()])
      .finally(() => setLoading(false));
  }, [fetchProduct, fetchVariants, fetchAttributeTemplates]);

  // ====== Product Info Update ======
  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await api.put(`/product/${productId}`, {
        name: editName,
        description: editDesc,
        basePrice: editPrice ? parseFloat(editPrice) : null,
      });
      showToast.success('Product info updated');
      setEditingInfo(false);
      await fetchProduct();
    } catch {
      showToast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // ====== Variant Form ======
  const resetForm = () => {
    setVSku('');
    setVPrice('');
    setVCompare('');
    setVCost('');
    setVStock('');
    setVImage('');
    setSelectedAttrNames(new Set());
    setVAttributes({});
    setColorImageUrls({});
    setEditingVariant(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (variant: VariantWithArrayAttrs) => {
    setEditingVariant(variant);
    const attrs = variant.attributes || {};

    // Populate selected attributes and their values
    const attrNames = new Set<string>();
    const attrValues: Record<string, string[]> = {};
    Object.entries(attrs).forEach(([key, value]) => {
      attrNames.add(key);
      if (Array.isArray(value)) {
        attrValues[key] = value;
      } else if (typeof value === 'string' && value.includes(',')) {
        attrValues[key] = value.split(',').map(s => s.trim());
      } else {
        attrValues[key] = value ? [value as string] : [];
      }
    });
    setSelectedAttrNames(attrNames);
    setVAttributes(attrValues);

    setVSku(variant.sku);
    setVPrice(String(variant.price));
    setVCompare(variant.compareAtPrice ? String(variant.compareAtPrice) : '');
    setVCost(String((variant as any).costPrice || ''));
    setVStock(String(variant.stock));
    setVImage(variant.image || '');
    // Populate color image URLs from variant attributes
    const colorImgs: Record<string, string> = {};
    if (attrs.Color) {
      const colorValues = Array.isArray(attrs.Color) ? attrs.Color : [attrs.Color as string];
      colorValues.forEach((c: string) => {
        const imgKey = `colorImage_${c}`;
        const existingImgs = (variant as any).variantImages || [];
        const found = existingImgs.find((img: any) => img.altText === c || img.color === c);
        colorImgs[c] = found ? found.url : '';
      });
    }
    setColorImageUrls(colorImgs);
    setShowForm(true);
  };

  // Toggle attribute selection (enable/disable)
  const toggleAttributeSelection = (attrName: string, enabled: boolean) => {
    const newSelected = new Set(selectedAttrNames);
    if (enabled) {
      newSelected.add(attrName);
      if (!vAttributes[attrName]) {
        setVAttributes({ ...vAttributes, [attrName]: [] });
      }
    } else {
      newSelected.delete(attrName);
      const newAttrs = { ...vAttributes };
      delete newAttrs[attrName];
      setVAttributes(newAttrs);
    }
    setSelectedAttrNames(newSelected);
  };

  // Handle multi-select value changes
  const handleAttributeValueChange = (attrName: string, values: string[]) => {
    // Clean up color image URLs for colors that were deselected
    if (attrName.toLowerCase() === 'color') {
      const newColorUrls = { ...colorImageUrls };
      Object.keys(newColorUrls).forEach(color => {
        if (!values.includes(color)) delete newColorUrls[color];
      });
      setColorImageUrls(newColorUrls);
    }
    setVAttributes({ ...vAttributes, [attrName]: values });
  };

  const handleColorImageChange = (colorValue: string, url: string) => {
    setColorImageUrls({ ...colorImageUrls, [colorValue]: url });
  };

  // SUBMIT – saves ONE variant with selected attributes and their values
  const handleSubmit = async () => {
    if (!vSku.trim()) { showToast.error('SKU is required'); return; }
    if (!vPrice) { showToast.error('Price is required'); return; }

    const attrs: Record<string, string> = {};
    selectedAttrNames.forEach((attrName) => {
      const values = vAttributes[attrName] || [];
      if (values.length > 0) {
        attrs[attrName] = JSON.stringify(values);
      }
    });

    if (Object.keys(attrs).length === 0) {
      showToast.error('Please select at least one attribute with values');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        productId,
        sku: vSku.trim(),
        price: Number(vPrice),
        compareAtPrice: vCompare ? Number(vCompare) : undefined,
        costPrice: vCost ? Number(vCost) : 0,
        stock: Number(vStock) || 0,
        image: vImage || undefined,
        attributes: attrs,
      };

      let savedVariantId = editingVariant?.id;
      if (editingVariant) {
        const res = await api.put(`/variants/${editingVariant.id}`, payload);
        savedVariantId = res.data.data?.id || editingVariant.id;
        showToast.success('Variant updated');
      } else {
        const res = await api.post('/variants', payload);
        savedVariantId = res.data.data?.id;
        showToast.success('Variant created');
      }

      // Save color image URLs as variant images
      const hasColor = Array.from(selectedAttrNames).some(n => n.toLowerCase() === 'color');
      if (savedVariantId && hasColor) {
        const colorImages = Object.entries(colorImageUrls)
          .filter(([_, url]) => url && url.trim())
          .map(([color, url]) => ({
            variantId: savedVariantId,
            url: url.trim(),
            altText: color,
            color: color,
            isPrimary: false,
            sortOrder: 0,
          }));

        // Remove existing color images first (to avoid duplicates on edit)
        if (editingVariant) {
          try {
            const existingImgs = await api.get(`/variant-images?variantId=${savedVariantId}`);
            if (existingImgs.data.success) {
              for (const img of existingImgs.data.data) {
                await api.delete(`/variant-images/${img.id}`);
              }
            }
          } catch (e) {
            console.error('Failed to clear old images', e);
          }
        }

        for (const imgData of colorImages) {
          try {
            const res = await api.post('/variant-images', imgData);
            if (!res.data.success) {
              console.error('Failed to save color image:', imgData, res.data.message);
              showToast.error(`Failed to save image for ${imgData.color}`);
            }
          } catch (e: any) {
            console.error('Failed to save color image:', imgData, e?.response?.data || e);
            showToast.error(`Failed to save image for ${imgData.color}: ${e?.response?.data?.message || e.message}`);
          }
        }
      }

      fetchVariants();
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to save variant');
    } finally {
      setSaving(false);
    }
  };

  // ====== Other CRUD ======
  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Delete this variant?')) return;
    try {
      await api.delete(`/variants/${id}`);
      showToast.success('Variant deleted');
      fetchVariants();
    } catch {
      showToast.error('Failed to delete variant');
    }
  };

  const handleDeleteAllVariants = async () => {
    if (variants.length === 0) return;
    if (!confirm(`Delete ALL ${variants.length} variants?`)) return;
    setSaving(true);
    try {
      for (const v of variants) {
        await api.delete(`/variants/${v.id}`);
      }
      showToast.success(`Deleted ${variants.length} variants`);
      fetchVariants();
    } catch {
      showToast.error('Failed to delete all variants');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustStock = async (id: string) => {
    const qty = prompt('Enter quantity to add (use negative to deduct):');
    if (qty === null) return;
    try {
      await api.post(`/variants/${id}/adjust-stock`, { quantity: Number(qty), reason: 'manual_adjustment' });
      showToast.success('Stock adjusted');
      fetchVariants();
    } catch {
      showToast.error('Failed to adjust stock');
    }
  };

  const duplicateVariant = async (variant: VariantWithArrayAttrs) => {
    const newSku = variant.sku + '-copy';
    try {
      await api.post('/variants', {
        productId,
        sku: newSku,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice || undefined,
        costPrice: (variant as any).costPrice || 0,
        stock: 0,
        attributes: variant.attributes,
        image: variant.image || undefined,
      });
      showToast.success('Duplicated as ' + newSku);
      fetchVariants();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to duplicate');
    }
  };

  // ====== Bulk Generation ======
  const handleBulkGenerate = async () => {
    if (!bulkSkuPrefix.trim()) { showToast.error('SKU prefix required'); return; }
    if (!bulkBasePrice) { showToast.error('Base price required'); return; }
    const attrsMap: Record<string, string[]> = {};
    for (const tpl of attributeTemplates) {
      if ((tpl.options || []).length > 0) attrsMap[tpl.name] = tpl.options;
    }
    if (Object.keys(attrsMap).length === 0) {
      showToast.error('No attribute templates with options found');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/variants/bulk/generate', {
        productId,
        attributes: attrsMap,
        basePrice: parseFloat(bulkBasePrice),
        skuPrefix: bulkSkuPrefix.trim(),
      });
      if (res.data.success) {
        showToast.success(`Created ${res.data.data.totalGenerated} variants`);
        fetchVariants();
        setBulkShow(false);
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Bulk generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const applyBulkEdit = async () => {
    if (variants.length === 0) return;
    try {
      for (const v of variants) {
        const payload: Record<string, any> = {};
        if (bulkNewPrice) payload.price = parseFloat(bulkNewPrice);
        if (bulkNewStock !== '') payload.stock = parseInt(bulkNewStock);
        if (Object.keys(payload).length > 0) {
          await api.put(`/variants/${v.id}`, payload);
        }
      }
      showToast.success('Bulk edit applied to all variants');
      setBulkEditMode(false);
      setBulkNewPrice('');
      setBulkNewStock('');
      fetchVariants();
    } catch {
      showToast.error('Bulk edit failed');
    }
  };

  const hasColorAttr = (variant: VariantWithArrayAttrs) => {
    const attrs = variant.attributes || {};
    const values = Array.isArray(attrs.Color) ? attrs.Color : (attrs.Color ? [attrs.Color as string] : []);
    return values.length > 0;
  };

  const colorValue = (variant: VariantWithArrayAttrs): string => {
    const attrs = variant.attributes || {};
    const v = attrs.Color;
    if (Array.isArray(v) && v.length > 0) return v[0];
    if (typeof v === 'string') return v;
    return '';
  };

  const openVariantImageManager = async (variant: VariantWithArrayAttrs) => {
    setManagingVariantId(variant.id);
    setNewVariantImageUrl('');
    const imgs = (variant.variantImages || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText || '',
      color: img.color,
      isPrimary: img.isPrimary || false,
      sortOrder: img.sortOrder || 0,
    }));
    setVariantImages(imgs);
  };

  const addVariantImage = async () => {
    if (!managingVariantId || !newVariantImageUrl.trim()) return;
    setSavingVariantImage(true);
    try {
      const res = await api.post('/variant-images', {
        variantId: managingVariantId,
        url: newVariantImageUrl.trim(),
        isPrimary: false,
        sortOrder: variantImages.length,
      });
      if (res.data.success) {
        setVariantImages((prev) => [...prev, res.data.data]);
        setNewVariantImageUrl('');
        showToast.success('Image added');
      }
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as any).response?.data?.message
        : undefined;
      showToast.error(message || 'Failed to add image');
    } finally {
      setSavingVariantImage(false);
    }
  };

  const removeVariantImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await api.delete(`/variant-images/${imageId}`);
      setVariantImages((prev) => prev.filter((img) => img.id !== imageId));
      showToast.success('Image deleted');
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as any).response?.data?.message
        : undefined;
      showToast.error(message || 'Failed to delete image');
    }
  };

  // ====== Render ======
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" /></div>;
  if (!product) return <div className="text-center py-16"><p className="text-gray-500">Product not found</p></div>;

  return (
    <div className="max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/product')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-sm">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">{variants.length} variant(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditingInfo(!editingInfo)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm text-sm hover:bg-gray-200">
            <FiEdit2 className="w-4 h-4 inline mr-1.5" /> Edit Info
          </button>
          <button onClick={() => router.push('/dashboard/product')} className="px-4 py-2 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700">
            <FiCheck className="w-4 h-4 inline mr-1.5" /> Done
          </button>
        </div>
      </div>

      {/* Edit Info */}
      {editingInfo && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Product Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price</label>
              <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveInfo} disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Info'}
            </button>
            <button onClick={() => setEditingInfo(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-sm text-sm hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk Generate Section */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Variants</h3>
            <p className="text-sm text-gray-500">Manage variants and attributes</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* <button onClick={() => setBulkShow(!bulkShow)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-sm hover:bg-red-700">
              <FiRefreshCw className="w-4 h-4" /> {bulkShow ? 'Hide' : 'Bulk Generate'}
            </button>
            <button onClick={() => setBulkEditMode(!bulkEditMode)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-sm hover:bg-red-700">
              <FiDollarSign className="w-4 h-4" /> {bulkEditMode ? 'Hide Bulk Edit' : 'Bulk Edit'}
            </button> */}
            <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700">
              <FiPlus className="w-4 h-4" /> Add Variant
            </button>
            {variants.length > 0 && (
              <button onClick={handleDeleteAllVariants} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-sm hover:bg-red-700">
                <FiTrash2 className="w-4 h-4" /> Delete All
              </button>
            )}
          </div>
        </div>

        {bulkShow && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Generate variants from ALL combinations of attribute options.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU Prefix *</label>
                <input type="text" value={bulkSkuPrefix} onChange={(e) => setBulkSkuPrefix(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="TSHIRT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price *</label>
                <input type="number" step="0.01" value={bulkBasePrice} onChange={(e) => setBulkBasePrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
              </div>
              <div className="flex items-end">
                <button onClick={handleBulkGenerate} disabled={generating} className="w-full px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 disabled:opacity-50 text-sm font-semibold">
                  {generating ? 'Generating...' : 'Generate All'}
                </button>
              </div>
            </div>
          </div>
        )}

        {bulkEditMode && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Apply price and stock to ALL {variants.length} variants.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Price (leave empty to skip)</label>
                <input type="number" step="0.01" value={bulkNewPrice} onChange={(e) => setBulkNewPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="Leave empty" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Stock (leave empty to skip)</label>
                <input type="number" value={bulkNewStock} onChange={(e) => setBulkNewStock(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="Leave empty" />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={applyBulkEdit} className="px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 text-sm font-semibold">
                  Apply to All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Variants Table */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Variants ({variants.length})</h3>
        </div>
        {variants.length === 0 ? (
          <div className="p-12 text-center">
            <FiGrid className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No variants yet</p>
            <button onClick={openCreateForm} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm font-semibold">
              Add First Variant
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attributes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((variant) => {
                  const attrs = variant.attributes || {};
                  return (
                    <tr key={variant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{variant.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[300px]">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(attrs).map(([key, value]) => {
                            const values = Array.isArray(value) ? value : [value];
                            return (
                              <div key={key} className="flex flex-wrap items-center gap-1">
                                <span className="text-xs font-semibold text-gray-500">{key}:</span>
                                {values.map((v, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5 text-xs">
                                    {key === 'Color' && (
                                      <span className="w-3 h-3 rounded-sm border border-gray-300" style={{ backgroundColor: v }} />
                                    )}
                                    {v}
                                  </span>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">৳{variant.price.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          variant.stock <= 0 ? 'bg-red-100 text-red-700' :
                          variant.stock <= 5 ? 'bg-red-100 text-red-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {variant.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => duplicateVariant(variant)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Duplicate">
                            <FiCopy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleAdjustStock(variant.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Adjust Stock">
                            <FiPlusIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEditForm(variant)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openVariantImageManager(variant)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Color Images" disabled={!hasColorAttr(variant)}>
                            <FiGrid className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteVariant(variant.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Color-wise Variant Image Manager ===== */}
      {managingVariantId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Variant Images</h3>
              <button onClick={() => setManagingVariantId(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVariantImageUrl}
                  onChange={(e) => setNewVariantImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm"
                  placeholder="Paste image URL..."
                />
                <button onClick={addVariantImage} disabled={savingVariantImage} className="px-4 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {savingVariantImage ? 'Adding...' : 'Add'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {variantImages.map((img) => (
                  <div key={img.id} className="relative border border-gray-200 rounded-sm overflow-hidden bg-gray-50">
                    <img src={img.url} alt={img.altText || ''} className="w-full h-24 object-cover" />
                    <button
                      onClick={() => removeVariantImage(img.id)}
                      className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-sm p-1 hover:bg-white"
                      title="Delete"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {variantImages.length === 0 && (
                  <p className="text-sm text-gray-500">No images yet for this variant.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== VARIANT FORM with Attribute Selection + Multi-Select Values ===== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVariant ? 'Edit Variant' : 'Add Variant'}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Basic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU *</label>
                  <input type="text" value={vSku} onChange={(e) => setVSku(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="PROD-S-M" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price *</label>
                  <input type="number" step="0.01" value={vPrice} onChange={(e) => setVPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Compare At Price</label>
                  <input type="number" step="0.01" value={vCompare} onChange={(e) => setVCompare(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost Price</label>
                  <input type="number" step="0.01" value={vCost} onChange={(e) => setVCost(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
                  <input type="number" value={vStock} onChange={(e) => setVStock(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0" />
                </div>
              </div>

              {/* ---------- ATTRIBUTE SELECTION (Choose which attributes to include) ---------- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Attributes for this Variant
                  <span className="text-xs text-gray-400 ml-2">(Check the ones you need)</span>
                </label>
                {attributeTemplates.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                    <p className="text-red-800 text-sm">No attribute templates found. Create them first.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-sm bg-gray-50">
                    {attributeTemplates.map((tpl) => {
                      const isSelected = selectedAttrNames.has(tpl.name);
                      return (
                        <label key={tpl.id} className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleAttributeSelection(tpl.name, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{tpl.name}</span>
                          <span className="text-xs text-gray-400">({tpl.options.length})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ---------- ATTRIBUTE VALUES (Multi-select for selected attributes) ---------- */}
              {selectedAttrNames.size > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Values for Each Attribute
                    <span className="text-xs text-gray-400 ml-2">(Multiple values allowed)</span>
                  </label>
                  <div className="space-y-3">
                    {Array.from(selectedAttrNames).map((attrName) => {
                      const template = attributeTemplates.find(t => t.name === attrName);
                      if (!template) return null;
                      const isColor = attrName.toLowerCase() === 'color';
                      return (
                        <MultiSelectDropdown
                          key={attrName}
                          label={attrName}
                          options={template.options || []}
                          selected={vAttributes[attrName] || []}
                          onChange={(values) => handleAttributeValueChange(attrName, values)}
                          colorImageUrls={isColor ? colorImageUrls : undefined}
                          onColorImageChange={isColor ? handleColorImageChange : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              )}


              {/* Submit buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold">
                  {saving ? 'Saving...' : editingVariant ? 'Update Variant' : 'Create Variant'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}