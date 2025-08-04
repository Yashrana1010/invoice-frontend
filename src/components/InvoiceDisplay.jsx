import React from 'react';
import { Calendar, User, DollarSign, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const InvoiceDisplay = ({ invoiceData }) => {
  if (!invoiceData) return null;

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DELETED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4" />;
      case 'DELETED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mt-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Invoice Details
          </h3>
          <p className="text-sm text-gray-600">
            Invoice #{invoiceData.InvoiceNumber || 'N/A'}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(invoiceData.Status)}`}>
          {getStatusIcon(invoiceData.Status)}
          {invoiceData.Status || 'Unknown'}
        </div>
      </div>

      {/* Customer & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Customer</p>
              <p className="text-sm text-gray-600">{invoiceData.Contact?.Name || 'Unknown'}</p>
              {invoiceData.Contact?.EmailAddress && (
                <p className="text-xs text-gray-500">{invoiceData.Contact.EmailAddress}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Invoice Date</p>
              <p className="text-sm text-gray-600">{formatDate(invoiceData.DateString)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Due Date</p>
              <p className="text-sm text-gray-600">{formatDate(invoiceData.DueDateString)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Amount Due</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(invoiceData.AmountDue, invoiceData.CurrencyCode)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {invoiceData.LineItems && invoiceData.LineItems.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Line Items</h4>

          {/* Desktop table view */}
          <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {invoiceData.LineItems.map((item, index) => (
              <div key={index} className="px-4 py-3 grid grid-cols-12 gap-2 text-sm border-t border-gray-100">
                <div className="col-span-6 text-gray-900">
                  <p className="font-medium">{item.Description}</p>
                  {item.ItemCode && (
                    <p className="text-xs text-gray-500">Code: {item.ItemCode}</p>
                  )}
                </div>
                <div className="col-span-2 text-center text-gray-600">
                  {item.Quantity || 1}
                </div>
                <div className="col-span-2 text-right text-gray-600">
                  {formatCurrency(item.UnitAmount, invoiceData.CurrencyCode)}
                </div>
                <div className="col-span-2 text-right font-medium text-gray-900">
                  {formatCurrency(item.LineAmount, invoiceData.CurrencyCode)}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {invoiceData.LineItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900 mb-2">{item.Description}</div>
                {item.ItemCode && (
                  <div className="text-xs text-gray-500 mb-2">Code: {item.ItemCode}</div>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Qty: </span>
                    <span className="text-gray-900">{item.Quantity || 1}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">Unit: </span>
                    <span className="text-gray-900">{formatCurrency(item.UnitAmount, invoiceData.CurrencyCode)}</span>
                  </div>
                  <div className="col-span-2 text-right pt-1 border-t border-gray-100">
                    <span className="font-medium text-gray-900">
                      Total: {formatCurrency(item.LineAmount, invoiceData.CurrencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">
              {formatCurrency(invoiceData.SubTotal, invoiceData.CurrencyCode)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">
              {formatCurrency(invoiceData.TotalTax, invoiceData.CurrencyCode)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">
              {formatCurrency(invoiceData.Total, invoiceData.CurrencyCode)}
            </span>
          </div>

          {invoiceData.AmountPaid > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-green-600">
                  {formatCurrency(invoiceData.AmountPaid, invoiceData.CurrencyCode)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-orange-600">
                <span>Amount Due</span>
                <span>
                  {formatCurrency(invoiceData.AmountDue, invoiceData.CurrencyCode)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {(invoiceData.Reference || invoiceData.Url) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            {invoiceData.Reference && (
              <div className="text-xs">
                <span className="text-gray-500">Reference: </span>
                <span className="text-gray-700">{invoiceData.Reference}</span>
              </div>
            )}
            {invoiceData.Url && (
              <div className="text-xs">
                <a
                  href={invoiceData.Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View in Xero
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDisplay;
