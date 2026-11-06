'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { ReturnRequest } from '@/types';

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [refundModal, setRefundModal] = useState<ReturnRequest | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('BANK_TRANSFER');
  const [refundTxnId, setRefundTxnId] = useState('');
  const [refundNotes, setRefundNotes] = useState('');

  const fetchReturns = useCallback(async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await api.get('/returns', { params });
      if (response.data.success) {
        // Backend returns { returns: [...], total, page, limit }
        const returnsList = response.data.data?.returns || response.data.data || [];
        setReturns(Array.isArray(returnsList) ? returnsList : []);
      }
    } catch {
      showToast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const updateStatus = async (id: string, status: string) => {
    const note = prompt('Admin note (optional):') || '';
    try {
      const response = await api.patch(`/returns/${id}/status`, { status, adminNote: note });
      if (response.data.success) {
        showToast.success(`Return ${status.toLowerCase()}!`);
        fetchReturns();
      } else {
        showToast.error(response.data.message || 'Failed to update');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update';
      showToast.error(msg);
    }
  };

  const processRefund = async () => {
    if (!refundModal) return;
    try {
      const response = await api.post(`/returns/${refundModal.id}/refund`, {
        amount: Number(refundAmount),
        method: refundMethod,
        transactionId: refundTxnId,
        notes: refundNotes,
      }, { validateStatus: (s) => s < 500 });
      if (response.data.success) {
        showToast.success('Refund processed!');
        setRefundModal(null);
        setRefundAmount('');
        setRefundMethod('BANK_TRANSFER');
        setRefundTxnId('');
        setRefundNotes('');
        fetchReturns();
      } else {
        showToast.error(response.data.message || 'Refund failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Refund failed';
      showToast.error(msg);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_APPROVAL: 'bg-red-100 text-red-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Return Requests</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="">All</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">No return requests.</div>
      ) : (
        <div className="grid gap-4">
          {returns.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold">{r.order?.orderNumber || 'N/A'}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-sm ${getStatusColor(r.status)}`}>{r.status}</span>
                  </div>
                  <p className="text-sm"><strong>Customer:</strong> {r.customerName} ({r.customerPhone})</p>
                  <p className="text-sm"><strong>Reason:</strong> {r.reason}</p>
                  {r.requestedAmount && <p className="text-sm"><strong>Requested:</strong> ৳{r.requestedAmount.toFixed(2)}</p>}
                  {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                </div>
                <div className="space-x-2">
                  {r.status === 'PENDING_APPROVAL' && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'APPROVED')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Approve</button>
                      <button onClick={() => updateStatus(r.id, 'REJECTED')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
                    </>
                  )}
                  {r.status === 'APPROVED' && (
                    <button onClick={() => setRefundModal(r)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Create Refund</button>
                  )}
                </div>
              </div>
              {r.adminNote && <p className="text-xs text-gray-500 mt-2">Note: {r.adminNote}</p>}
              {r.refund && (
                <div className="mt-3 p-3 bg-red-50 rounded text-sm">
                  <p><strong>Refund:</strong> ৳{r.refund.amount.toFixed(2)} via {r.refund.method}</p>
                  {r.refund.transactionId && <p>Transaction: {r.refund.transactionId}</p>}
                  <p>Status: {r.refund.status}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {refundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Process Refund</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input type="number" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Method</label>
                <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Transaction ID</label>
                <input type="text" value={refundTxnId} onChange={(e) => setRefundTxnId(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={refundNotes} onChange={(e) => setRefundNotes(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-4">
                <button onClick={processRefund} disabled={!refundAmount} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Process</button>
                <button onClick={() => setRefundModal(null)} className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}