'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { formatNamedAttributes } from '@/lib/attrUtils';
import { Order } from '@/types';
import { FiArrowLeft, FiDownload, FiSend, FiPrinter, FiCheck, FiX, FiLoader } from 'react-icons/fi';

// ─── ESC/POS Builder for 58mm Thermal Printer ─────────────────────────
function buildEscPosReceipt(order: Order, storeInfo: any) {
  const line = (text = '', align = 'center', bold = false) => {
    const styles = [];
    if (bold) styles.push('\x1B\x45\x01'); // ESC E 1 - Bold ON
    if (align === 'center') styles.push('\x1B\x61\x01'); // ESC a 1 - Center
    else if (align === 'right') styles.push('\x1B\x61\x02'); // ESC a 2 - Right
    else styles.push('\x1B\x61\x00'); // ESC a 0 - Left
    return styles.join('') + text + '\x0A'; // LF
  };

  const boldOff = '\x1B\x45\x00'; // ESC E 0
  const doubleHeight = '\x1B\x21\x10'; // ESC ! 0x10
  const doubleWidth = '\x1B\x21\x20'; // ESC ! 0x20
  const normalSize = '\x1B\x21\x00'; // ESC ! 0x00
  const cut = '\x1D\x56\x00'; // GS V 0 - Full cut
  const openDrawer = '\x1B\x70\x00\x19\xFA'; // ESC p 0 25 250 - Open cash drawer

  const storeName = storeInfo?.companyName || storeInfo?.name || 'Store';
  const currencySymbol = storeInfo?.currencySymbol || '৳';
  const formatCurr = (n: number) => `${currencySymbol}${Number(n).toFixed(2)}`;

  const dashes = '─'.repeat(32);
  const doubleLine = '═'.repeat(32);

  let receipt = '';

  // Header
  receipt += line(doubleLine);
  receipt += line(doubleHeight + doubleWidth + storeName, 'center', true);
  receipt += line(normalSize);
  receipt += line('Order Invoice', 'center', true);
  receipt += line('অর্ডার চালান', 'center');
  receipt += line(`Order: ${order.orderNumber}`, 'center');
  receipt += line(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, 'center');
  receipt += line(doubleLine);
  receipt += line();

  // Customer
  receipt += line('CUSTOMER', 'left', true);
  receipt += line(boldOff + order.customerName, 'left');
  receipt += line(order.customerPhone, 'left');
  if (order.customerAddress) receipt += line(order.customerAddress, 'left');
  receipt += line(dashes);
  receipt += line();

  // Items
  receipt += line('ITEM                    AMOUNT', 'left', true);
  receipt += line(boldOff + dashes);

  let itemLines = 0;
  for (const item of order.items || []) {
    const name = item.skuAtTime || item.variant?.sku || 'Product';
    const line1 = `${name.substring(0, 22)}`;
    const attributes = formatNamedAttributes(item.attributes || item.variant?.attributes);
    const line2 = `${attributes ? `${attributes.substring(0, 26)}\n  ` : '  '}${item.quantity} × ${formatCurr(item.priceAtTime)}     ${formatCurr(item.total)}`;
    receipt += line(line1, 'left');
    receipt += line(line2, 'left');
    itemLines++;
  }

  receipt += line(dashes);
  receipt += line();

  // Totals
  receipt += line(`Subtotal         ${formatCurr(order.subtotal)}`, 'right');
  receipt += line(`Delivery         ${formatCurr(order.deliveryCharge || 0)}`, 'right');
  if (order.discount && order.discount > 0) {
    receipt += line(`Discount        -${formatCurr(order.discount)}`, 'right');
  }
  receipt += line(doubleLine);
  receipt += line(doubleHeight + `TOTAL  ${formatCurr(order.total)}`, 'center', true);
  receipt += line(normalSize);
  receipt += line(doubleLine);
  receipt += line();

  // Payment info
  receipt += line(`Payment: ${order.paymentStatus}`, 'center');
  receipt += line(`Status: ${order.status}`, 'center');
  receipt += line();

  // Footer
  receipt += line(dashes);
  receipt += line();
  receipt += line('Thank you! 🙏', 'center', true);
  receipt += line(boldOff);
  receipt += line('Visit again!', 'center');
  receipt += line();
  receipt += line(dashes);
  receipt += line();

  // Cut and open drawer
  receipt += cut;
  receipt += openDrawer;

  return receipt;
}

// ─── Print Preview Component ──────────────────────────────────────────
function PrintPreview({ order, onClose }: { order: Order; onClose: () => void }) {
  const storeInfo = (order as any).tenant || {};
  const storeName = storeInfo?.companyName || storeInfo?.name || 'Store';
  const currencySymbol = storeInfo?.currencySymbol || '৳';
  const formatCurr = (n: number) => `${currencySymbol}${Number(n).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Preview Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">Print Preview</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>

        {/* Receipt Preview (80mm style) */}
        <div className="p-4 bg-gray-50 flex justify-center">
          <div className="bg-white shadow-inner" style={{ width: '58mm', fontFamily: 'monospace', fontSize: '10px', padding: '8px', lineHeight: '1.4' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{storeName}</div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>Order Invoice</div>
              <div style={{ fontSize: '9px' }}>অর্ডার চালান</div>
              <div>Order: {order.orderNumber}</div>
              <div>Date: {new Date(order.createdAt).toLocaleDateString('en-GB')}</div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>
            <div><strong>Customer:</strong> {order.customerName}</div>
            <div>{order.customerPhone}</div>
            {order.customerAddress && <div>{order.customerAddress}</div>}
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.skuAtTime || item.variant?.sku || 'Product'} — {formatNamedAttributes(item.attributes || item.variant?.attributes)} × {item.quantity}</span>
                <span>{formatCurr(item.total)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span><span>{formatCurr(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery</span><span>{formatCurr(order.deliveryCharge || 0)}</span>
            </div>
            {order.discount && order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount</span><span>-{formatCurr(order.discount)}</span>
              </div>
            )}
            <div style={{ borderTop: '2px solid #000', margin: '4px 0', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
              <span>TOTAL</span><span>{formatCurr(order.total)}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <div>Payment: {order.paymentStatus}</div>
              <div>Status: {order.status}</div>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>
            <div style={{ textAlign: 'center', fontWeight: 700 }}>Thank you! 🙏</div>
            <div style={{ textAlign: 'center' }}>Visit again!</div>
          </div>
        </div>

        {/* Print Button */}
        <div className="p-4 border-t">
          <button
            onClick={() => {
              const receipt = buildEscPosReceipt(order, storeInfo);
              printViaBluetooth(receipt);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-sm hover:bg-red-700 transition-all"
          >
            <FiPrinter /> Print via Bluetooth
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Web Bluetooth Printing ────────────────────────────────────────────
async function printViaBluetooth(receiptData: string) {
  try {
    // Request Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
    });

    showToast.loading('Connecting to printer...');

    const server = await device.gatt?.connect();
    if (!server) {
      showToast.dismiss();
      showToast.error('Failed to connect to printer');
      return;
    }

    // Try common printer services
    const serviceUuids = [
      '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
      '00001810-0000-1000-8000-00805f9b34fb', // Standard service
    ];

    let service: BluetoothRemoteGATTService | null = null;
    for (const uuid of serviceUuids) {
      try {
        service = await server.getPrimaryService(uuid);
        if (service) break;
      } catch {
        continue;
      }
    }

    if (!service) {
      // Try getting all services
      const services = await server.getPrimaryServices();
      if (services.length > 0) {
        service = services[0];
      } else {
        showToast.dismiss();
        showToast.error('No printer service found');
        await server.disconnect();
        return;
      }
    }

    // Get characteristic (try common TX characteristic)
    let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
    const charUuids = [
      '00002af1-0000-1000-8000-00805f9b34fb',
      '0000aaf1-0000-1000-8000-00805f9b34fb',
    ];

    for (const uuid of charUuids) {
      try {
        characteristic = await service.getCharacteristic(uuid);
        if (characteristic) break;
      } catch {
        continue;
      }
    }

    if (!characteristic) {
      const characteristics = await service.getCharacteristics();
      if (characteristics.length > 0) {
        characteristic = characteristics[0];
      } else {
        showToast.dismiss();
        showToast.error('No writable characteristic found');
        await server.disconnect();
        return;
      }
    }

    // Convert string to bytes (ESC/POS format)
    const encoder = new TextEncoder();
    const data = encoder.encode(receiptData);

    // Send data in chunks (max 512 bytes per write)
    const CHUNK_SIZE = 512;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, Math.min(i + CHUNK_SIZE, data.length));
      await characteristic.writeValue(chunk);
    }

    showToast.dismiss();
    showToast.success('Printed successfully!');

    await server.disconnect();
  } catch (error: any) {
    showToast.dismiss();
    if (error.name === 'NotFoundError') {
      showToast.error('No printer selected');
    } else {
      showToast.error('Print failed: ' + (error.message || 'Unknown error'));
    }
  }
}

// ─── Main Order Detail Page ───────────────────────────────────────────
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('damaged');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnAmount, setReturnAmount] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await api.get(`/orders/${params.id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch {
      showToast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchOrder();
  }, [params.id, fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(newStatus);
    try {
      await api.put(`/orders/${params.id}`, {
        status: newStatus,
        note: `Status updated to ${newStatus}`,
      });
      showToast.success('Status updated!');
      await fetchOrder();
    } catch {
      showToast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/orders/${params.id}/notes`, { comment: newComment });
      showToast.success('Comment added!');
      setNewComment('');
      fetchOrder();
    } catch {
      showToast.error('Failed to add comment');
    }
  };

  const sendInvoiceEmail = async () => {
    if (!order) return;
    setSendingEmail(true);
    try {
      const response = await api.post(`/orders/${params.id}/send-invoice`);
      if (response.data.success) {
        showToast.success('Invoice sent to customer email!');
      } else {
        showToast.error(response.data.message || 'Failed to send invoice');
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to send invoice');
    } finally {
      setSendingEmail(false);
    }
  };

  const downloadInvoice = () => {
    if (!order) return;

    const format = (n: number) =>
      new Intl.NumberFormat('bn-BD').format(n);

    const win = window.open('', '_blank');
    if (!win) {
      showToast.error('Popup blocked');
      return;
    }

    const items = order.items
      ?.map(
        (i) => `
        <tr>
          <td>
            <div style="font-weight:600;font-size:12px">
              ${i.variant?.sku || 'Product'}
            </div>
            <div style="font-size:10px;color:#666">
              ${formatNamedAttributes(i.attributes || i.variant?.attributes)}
            </div>
            <div style="font-size:10px;color:#666">
              ${i.quantity} × ৳${format(i.priceAtTime)}
            </div>
          </td>
          <td style="text-align:right;font-weight:600">
            ৳${format(i.total)}
          </td>
        </tr>
      `
      )
      .join('');

    win.document.write(`
    <html>
    <head>
      <title>Order Invoice - ${order.orderNumber}</title>
      <style>
        body{ width:80mm; margin:auto; padding:10px; font-family:Arial; font-size:12px; color:#111; }
        .center{text-align:center}
        .title{font-size:18px;font-weight:700;}
        .sub{font-size:11px;color:#666;}
        .line{border-top:1px dashed #000;margin:8px 0;}
        table{width:100%;border-collapse:collapse;}
        td{padding:4px 0;vertical-align:top;}
        .row{display:flex;justify-content:space-between;margin:2px 0;}
        .total{font-size:15px;font-weight:700;border-top:2px solid #000;margin-top:8px;padding-top:8px;}
        .box{border:1px solid #000;padding:5px;margin-top:8px;text-align:center;font-weight:700;}
        .footer{text-align:center;font-size:11px;margin-top:10px;}
        @page{size:80mm auto;margin:2mm;}
      </style>
    </head>
    <body>
      <div class="center">
        <div class="title">Order Invoice</div>
        <div class="sub">চালান</div>
      </div>
      <div class="line"></div>
      <div><b>Order:</b> ${order.orderNumber}<br/>
      <b>Date:</b> ${new Date(order.createdAt).toLocaleDateString('bn-BD')}</div>
      <div class="line"></div>
      <div><b>Customer:</b><br/>
      ${order.customerName}<br/>
      ${order.customerPhone}<br/>
      ${order.customerAddress || ''}</div>
      <div class="line"></div>
      <table>${items}</table>
      <div class="line"></div>
      <div class="row"><span>Subtotal</span><span>৳${format(order.subtotal)}</span></div>
      <div class="row"><span>Delivery</span><span>৳${format(order.deliveryCharge || 0)}</span></div>
      <div class="row"><span>Discount</span><span>৳${format(order.discount)}</span></div>
      <div class="total"><div class="row"><span>Total</span><span>৳${format(order.total)}</span></div></div>
      <div class="box">${order.paymentStatus}</div>
      <div class="box">${order.status}</div>
      <div class="footer">ধন্যবাদ ❤️<br/>আবার কেনাকাটা করুন</div>
      <script>window.onload = () => { setTimeout(() => window.print(), 300); }</script>
    </body>
    </html>
    `);
    win.document.close();
  };

  const createReturnRequest = async () => {
    if (!order) return;
    try {
      const response = await api.post('/returns', {
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail || `${order.customerPhone}@guest.local`,
        customerPhone: order.customerPhone,
        reason: returnReason,
        description: returnDescription,
        requestedAmount: Number(returnAmount) || undefined,
      }, { validateStatus: (status) => status < 500 });
      if (response.data.success) {
        showToast.success('Return request created!');
        setShowReturnForm(false);
        setReturnReason('damaged');
        setReturnDescription('');
        setReturnAmount('');
      } else {
        showToast.error(response.data.message || 'Failed to create return request');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create return request';
      showToast.error(msg);
    }
  };

  const statusOptions = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVEred', 'CANCELLED'];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }
  if (!order) {
    return <div className="text-center py-12 text-gray-600">Order not found</div>;
  }

  return (
    <div>
      {/* Print Preview Modal */}
      {showPrintPreview && order && (
        <PrintPreview order={order} onClose={() => setShowPrintPreview(false)} />
      )}

      <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-600 hover:text-gray-900">
        <FiArrowLeft className="mr-2" /> Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-sm text-sm font-semibold ${order.status === 'DELIVEred' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{order.status}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={downloadInvoice} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-all flex items-center gap-1">
            <FiDownload size={14} /> Invoice
          </button>
          {order.customerEmail && (
            <button onClick={sendInvoiceEmail} disabled={sendingEmail}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all flex items-center gap-1 disabled:opacity-50">
              <FiSend size={14} /> {sendingEmail ? 'Sending...' : 'Email Invoice'}
            </button>
          )}
          <button onClick={() => setShowPrintPreview(true)}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-all flex items-center gap-1">
            <FiPrinter size={14} /> Print (Bluetooth)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Info</h3>
            <p><strong>Name:</strong> {order.customerName}</p>
            <p><strong>Phone:</strong> {order.customerPhone}</p>
            {order.customerEmail && <p><strong>Email:</strong> {order.customerEmail}</p>}
            {order.customerAddress && <p><strong>Address:</strong> {order.customerAddress}</p>}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Summary</h3>
            <p><strong>Subtotal:</strong> ৳{order.subtotal.toFixed(2)}</p>
            <p><strong>Delivery Charge:</strong> ৳{(order.deliveryCharge || 0).toFixed(2)}</p>
            <p><strong>Discount:</strong> ৳{order.discount.toFixed(2)}</p>
            <p className="text-lg font-bold">Total: ৳{order.total.toFixed(2)}</p>
            <p><strong>Payment:</strong> {order.paymentStatus}</p>
          </div>
        </div>

        {/* Items Table */}
        {order.items && order.items.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm">
                        <div>{item.skuAtTime || item.variant?.sku || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{formatNamedAttributes(item.attributes || item.variant?.attributes)}</div>
                      </td>
                      <td className="px-4 py-2 text-sm">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm">৳{item.priceAtTime.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm">৳{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Update */}
        <div className="border-t pt-6 mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button key={status} onClick={() => updateStatus(status)} disabled={updatingStatus !== null || order.status === status}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${order.status === status ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {updatingStatus === status ? <span className="inline-flex items-center gap-2"><FiLoader className="animate-spin" /> Updating...</span> : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Internal Comments */}
        <div className="border-t pt-6 mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Internal Comments</h3>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 px-4 py-2 border rounded-lg" />
            <button onClick={addComment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
          </div>
          {order.notes && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{order.notes}</p>}
        </div>

        {/* Return */}
        <div className="border-t pt-6 mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Return & Refund</h3>
          {!showReturnForm ? (
            <button onClick={() => setShowReturnForm(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              Create Return Request
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">New Return Request</h4>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Reason</label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="damaged">Damaged</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="defective">Defective</option>
                  <option value="not_as_described">Not as Described</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Description</label>
                <textarea value={returnDescription} onChange={(e) => setReturnDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Requested Amount (optional)</label>
                <input type="number" step="0.01" value={returnAmount} onChange={(e) => setReturnAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={createReturnRequest} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Submit</button>
                <button onClick={() => setShowReturnForm(false)} className="px-4 py-2 bg-gray-300 rounded text-sm hover:bg-gray-400">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Status History</h3>
            <div className="space-y-2">
              {order.statusHistory.map((h) => (
                <div key={h.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                  <span className="font-medium">{h.status}</span>
                  <span className="text-gray-500">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}