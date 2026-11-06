'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'bn' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // Sidebar
  'sidebar.dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  'sidebar.product': { bn: 'পণ্য', en: 'Product' },
  'sidebar.variants': { bn: 'ভেরিয়েন্ট', en: 'Variants' },
  'sidebar.attributes': { bn: 'অ্যাট্রিবিউট', en: 'Attributes' },
  'sidebar.categories': { bn: 'ক্যাটাগরি', en: 'Categories' },
  'sidebar.subcategories': { bn: 'সাব-ক্যাটাগরি', en: 'Sub Categories' },
  'sidebar.brands': { bn: 'ব্র্যান্ড', en: 'Brands' },
  'sidebar.orders': { bn: 'অর্ডার', en: 'Orders' },
  'sidebar.customers': { bn: 'ক্রেতা', en: 'Customers' },
  'sidebar.returns': { bn: 'রিটার্ন', en: 'Returns' },
  'sidebar.reviews': { bn: 'রিভিউ', en: 'Reviews' },
  'sidebar.blocking': { bn: 'ব্লকিং', en: 'Blocking' },
  'sidebar.landing': { bn: 'ল্যান্ডিং পেজ', en: 'Landing Page' },
  'sidebar.users': { bn: 'ইউজার', en: 'Users' },
  'sidebar.payments': { bn: 'পেমেন্ট', en: 'Payments' },
  'sidebar.notifications': { bn: 'নোটিফিকেশন', en: 'Notifications' },
  'sidebar.settings': { bn: 'সেটিংস', en: 'Settings' },
  'sidebar.more': { bn: 'আরও মেনু', en: 'More Menu' },
  'sidebar.logout': { bn: 'লগআউট', en: 'Logout' },
  'sidebar.collapse': { bn: 'সঙ্কুচিত করুন', en: 'Collapse' },
  'sidebar.expand': { bn: 'প্রসারিত করুন', en: 'Expand' },
  'sidebar.brand': { bn: 'মাল্টি-টেন্যান্ট', en: 'Multi-Tenant' },
  'sidebar.banners': { bn: 'ব্যানার', en: 'Banners' },
  'sidebar.suppliers': { bn: 'সাপ্লায়ার', en: 'Suppliers' },
  'sidebar.shipping': { bn: 'শিপিং', en: 'Shipping' },
  'sidebar.expenses': { bn: 'খরচ', en: 'Expenses' },
  'sidebar.coupons': { bn: 'কুপন', en: 'Coupons' },
  'sidebar.wishlist': { bn: 'উইশলিস্ট', en: 'Wishlist' },
  'sidebar.incomplete_checkouts': { bn: 'অসম্পূর্ণ অর্ডার', en: 'Incomplete Orders' },
  'sidebar.main': { bn: 'প্রধান', en: 'Main' },
  'sidebar.catalog': { bn: 'ক্যাটালগ', en: 'Catalog' },
  'sidebar.business': { bn: 'ব্যবসা', en: 'Business' },
  'sidebar.finance': { bn: 'অর্থ', en: 'Finance' },
  'sidebar.other': { bn: 'অন্যান্য', en: 'Other' },
  'sidebar.configuration': { bn: 'কনফিগারেশন', en: 'Configuration' },

  // Dashboard
  'dashboard.title': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  'dashboard.subtitle': { bn: 'আপনার ব্যবসার সার্বিক অবস্থা', en: 'Your business overview' },
  'dashboard.totalProducts': { bn: 'মোট পণ্য', en: 'Total Products' },
  'dashboard.totalOrders': { bn: 'মোট অর্ডার', en: 'Total Orders' },
  'dashboard.totalCustomers': { bn: 'মোট ক্রেতা', en: 'Total Customers' },
  'dashboard.totalRevenue': { bn: 'মোট আয়', en: 'Total Revenue' },
  'dashboard.revenueOverview': { bn: 'আয় ওভারভিউ', en: 'Revenue Overview' },
  'dashboard.last6Months': { bn: 'গত ৬ মাসের আয়ের গ্রাফ', en: 'Revenue chart for last 6 months' },
  'dashboard.quickStats': { bn: 'দ্রুত পরিসংখ্যান', en: 'Quick Statistics' },
  'dashboard.recentOrders': { bn: 'সাম্প্রতিক অর্ডার', en: 'Recent Orders' },
  'dashboard.viewAll': { bn: 'সব দেখুন', en: 'View All' },
  'dashboard.quickActions': { bn: 'দ্রুত', en: 'Quick Actions' },
  'dashboard.manageProduct': { bn: 'পণ্য ব্যবস্থাপনা', en: 'Manage Product' },
  'dashboard.manageVariants': { bn: 'ভেরিয়েন্ট ব্যবস্থাপনা', en: 'Manage Variants' },
  'dashboard.viewOrders': { bn: 'অর্ডার দেখুন', en: 'View Orders' },
  'dashboard.order_num': { bn: 'অর্ডার #', en: 'Order #' },
  'dashboard.customer': { bn: 'ক্রেতা', en: 'Customer' },
  'dashboard.total': { bn: 'মোট', en: 'Total' },
  'dashboard.status': { bn: 'স্ট্যাটাস', en: 'Status' },

  // Orders
  'orders.title': { bn: 'অর্ডার সমূহ', en: 'Orders' },
  'orders.subtitle': { bn: 'সকল অর্ডার দেখুন এবং ব্যবস্থাপনা করুন', en: 'View and manage all orders' },
  'orders.all': { bn: 'সকল অর্ডার', en: 'All Orders' },
  'orders.pending': { bn: 'বিচারাধীন', en: 'Pending' },
  'orders.confirmed': { bn: 'নিশ্চিত', en: 'Confirmed' },
  'orders.processing': { bn: 'প্রক্রিয়াধীন', en: 'Processing' },
  'orders.shipped': { bn: 'পাঠানো হয়েছে', en: 'Shipped' },
  'orders.delivered': { bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered' },
  'orders.cancelled': { bn: 'বাতিল', en: 'Cancelled' },
  'orders.returned': { bn: 'ফেরত', en: 'Returned' },
  'orders.packed': { bn: 'প্যাকেটকৃত', en: 'Packed' },
  'orders.outForDelivery': { bn: 'ডেলিভারির পথে', en: 'Out for Delivery' },
  'orders.date': { bn: 'তারিখ', en: 'Date' },
  'orders.action': { bn: 'অ্যাকশন', en: 'Actions' },
  'orders.details': { bn: 'বিস্তারিত', en: 'Details' },
  'orders.delete': { bn: 'ডিলিট', en: 'Delete' },
  'orders.noOrders': { bn: 'কোনো অর্ডার পাওয়া যায়নি', en: 'No orders found' },
  'orders.noOrdersSub': { bn: 'নতুন অর্ডার আসলে এখানে দেখা যাবে', en: 'New orders will appear here' },
  'orders.total': { bn: 'মোট অর্ডার', en: 'Total Orders' },
  'orders.deleteConfirm': { bn: 'আপনি কি "{0}" অর্ডারটি ডিলিট করতে চান?', en: 'Are you sure you want to delete order "{0}"?' },
  'orders.deleted': { bn: 'অর্ডার সফলভাবে ডিলিট করা হয়েছে', en: 'Order deleted successfully' },
  'orders.loadError': { bn: 'অর্ডার লোড করতে সমস্যা হয়েছে', en: 'Failed to load orders' },

  // Product
  'product.title': { bn: 'পণ্য ব্যবস্থাপনা', en: 'Product Management' },
  'product.edit': { bn: 'এডিট', en: 'Edit' },
  'product.delete': { bn: 'ডিলিট', en: 'Delete' },
  'product.deleting': { bn: 'ডিলিট হচ্ছে...', en: 'Deleting...' },
  'product.noProduct': { bn: 'কোনো পণ্য নেই', en: 'No Product Yet' },
  'product.createFirst': { bn: 'প্রথম পণ্য তৈরি করুন', en: 'Create your first product' },
  'product.create': { bn: 'পণ্য তৈরি করুন', en: 'Create Product' },
  'product.editTitle': { bn: 'পণ্য এডিট', en: 'Edit Product' },
  'product.createTitle': { bn: 'নতুন পণ্য', en: 'Create Product' },
  'product.name': { bn: 'পণ্যের নাম', en: 'Product Name' },
  'product.nameReq': { bn: 'পণ্যের নাম আবশ্যক', en: 'Product name is required' },
  'product.description': { bn: 'বিবরণ', en: 'Description' },
  'product.basePrice': { bn: 'ভিত্তি মূল্য', en: 'Base Price' },
  'product.images': { bn: 'ছবি (কমা দ্বারা আলাদা করুন)', en: 'Images (comma-separated URLs)' },
  'product.saving': { bn: 'সংরক্ষণ হচ্ছে...', en: 'Saving...' },
  'product.update': { bn: 'আপডেট', en: 'Update Product' },
  'product.cancel': { bn: 'বাতিল', en: 'Cancel' },
  'product.updated': { bn: 'পণ্য আপডেট করা হয়েছে', en: 'Product updated' },
  'product.created': { bn: 'পণ্য তৈরি করা হয়েছে', en: 'Product created' },
  'product.deleteConfirm': { bn: 'আপনি কি এই পণ্য ডিলিট করতে চান? সব ভেরিয়েন্টও ডিলিট হবে।', en: 'Delete this product? All variants will be deleted.' },
  'product.deleted': { bn: 'পণ্য ডিলিট করা হয়েছে', en: 'Product deleted' },

  // Variants
  'variants.title': { bn: 'ভেরিয়েন্ট ব্যবস্থাপনা', en: 'Variant Management' },
  'variants.add': { bn: 'নতুন ভেরিয়েন্ট', en: 'Add Variant' },
  'variants.edit': { bn: 'ভেরিয়েন্ট এডিট', en: 'Edit Variant' },
  'variants.sku': { bn: 'SKU', en: 'SKU' },
  'variants.price': { bn: 'মূল্য', en: 'Price' },
  'variants.comparePrice': { bn: 'তুলনা মূল্য', en: 'Compare Price' },
  'variants.stock': { bn: 'স্টক', en: 'Stock' },
  'variants.image': { bn: 'ছবি URL', en: 'Image URL' },
  'variants.attributes': { bn: 'অ্যাট্রিবিউট', en: 'Attributes' },
  'variants.noVariants': { bn: 'কোনো ভেরিয়েন্ট নেই', en: 'No variants yet' },
  'variants.bulkGenerate': { bn: 'বাল্ক জেনারেট', en: 'Bulk Generate' },
  'variants.bulkTitle': { bn: 'বাল্ক ভেরিয়েন্ট জেনারেট', en: 'Bulk Generate Variants' },
  'variants.bulkDesc': { bn: 'আপনার অ্যাট্রিবিউট থেকে সব কম্বিনেশন জেনারেট করুন।', en: 'Generate all possible combinations from your attributes.' },
  'variants.bulkNoAttr': { bn: 'কোনো অ্যাট্রিবিউট টেমপ্লেট পাওয়া যায়নি। প্রথমে অ্যাট্রিবিউট পেজে যান।', en: 'No attribute templates found. Go to Attributes page first.' },
  'variants.bulkUsing': { bn: 'এই অ্যাট্রিবিউট ব্যবহার করা হবে:', en: 'Using these attributes:' },
  'variants.bulkSkuPrefix': { bn: 'SKU উপসর্গ', en: 'SKU Prefix' },
  'variants.bulkBasePrice': { bn: 'ভিত্তি মূল্য', en: 'Base Price' },
  'variants.bulkGenerating': { bn: 'জেনারেট হচ্ছে...', en: 'Generating...' },
  'variants.bulkGenerateBtn': { bn: 'ভেরিয়েন্ট জেনারেট', en: 'Generate Variants' },
  'variants.createTitle': { bn: 'নতুন ভেরিয়েন্ট', en: 'Add New Variant' },
  'variants.editTitle': { bn: 'ভেরিয়েন্ট এডিট', en: 'Edit Variant' },
  'variants.skuReq': { bn: 'SKU আবশ্যক', en: 'SKU is required' },
  'variants.priceReq': { bn: 'মূল্য আবশ্যক', en: 'Price is required' },
  'variants.stockReq': { bn: 'স্টক আবশ্যক', en: 'Stock is required' },
  'variants.selectAttr': { bn: 'অ্যাট্রিবিউট নির্বাচন করুন', en: 'Select attributes' },
  'variants.selectAttrReq': { bn: 'অন্তত একটি অ্যাট্রিবিউট নির্বাচন করুন', en: 'Please select at least one attribute' },
  'variants.updated': { bn: 'ভেরিয়েন্ট আপডেট করা হয়েছে', en: 'Variant updated' },
  'variants.created': { bn: 'ভেরিয়েন্ট তৈরি করা হয়েছে', en: 'Variant created' },
  'variants.deleteConfirm': { bn: 'এই ভেরিয়েন্টটি ডিলিট করবেন?', en: 'Delete this variant?' },
  'variants.deleted': { bn: 'ভেরিয়েন্ট ডিলিট করা হয়েছে', en: 'Variant deleted' },
  'variants.adjustStock': { bn: 'স্টক অ্যাডজাস্ট', en: 'Adjust Stock' },
  'variants.adjustStockPrompt': { bn: 'পরিমাণ দিন (যোগ করতে পজিটিভ, বিয়োগ করতে নেগেটিভ):', en: 'Enter quantity (positive to add, negative to subtract):' },
  'variants.stockAdjusted': { bn: 'স্টক অ্যাডজাস্ট করা হয়েছে', en: 'Stock adjusted' },
  'variants.actions': { bn: 'অ্যাকশন', en: 'Actions' },
  'variants.tableSku': { bn: 'SKU', en: 'SKU' },
  'variants.tableAttributes': { bn: 'অ্যাট্রিবিউট', en: 'Attributes' },
  'variants.tablePrice': { bn: 'মূল্য', en: 'Price' },
  'variants.tableStock': { bn: 'স্টক', en: 'Stock' },
  'variants.createdCount': { bn: '{0}টি ভেরিয়েন্ট জেনারেট করা হয়েছে', en: 'Generated {0} variants' },

  // Attributes
  'attributes.title': { bn: 'অ্যাট্রিবিউট ব্যবস্থাপনা', en: 'Attributes' },
  'attributes.subtitle': { bn: 'ওজন, রঙ, সাইজের মতো অ্যাট্রিবিউট সংজ্ঞায়িত করুন', en: 'Define your product attributes like Weight, Color, Size' },
  'attributes.add': { bn: 'নতুন অ্যাট্রিবিউট', en: 'Add Attribute' },
  'attributes.createTitle': { bn: 'নতুন অ্যাট্রিবিউট', en: 'Add New Attribute' },
  'attributes.editTitle': { bn: 'অ্যাট্রিবিউট এডিট', en: 'Edit Attribute' },
  'attributes.name': { bn: 'অ্যাট্রিবিউট নাম', en: 'Attribute Name' },
  'attributes.nameReq': { bn: 'অ্যাট্রিবিউট নাম আবশ্যক', en: 'Attribute name is required' },
  'attributes.displayType': { bn: 'ডিসপ্লে টাইপ', en: 'Display Type' },
  'attributes.typeText': { bn: 'টেক্সট (ড্রপডাউন)', en: 'Text (dropdown)' },
  'attributes.typeColor': { bn: 'রঙ (কালার পিকার)', en: 'Color (color picker)' },
  'attributes.typeNumber': { bn: 'সংখ্যা', en: 'Number' },
  'attributes.options': { bn: 'অপশন (সম্ভাব্য মান)', en: 'Options (possible values)' },
  'attributes.optionsPlaceholder': { bn: 'টাইপ করে Enter চাপুন বা Add বাটনে ক্লিক করুন', en: 'Type and press Enter or click Add' },
  'attributes.addOption': { bn: 'যোগ', en: 'Add' },
  'attributes.noOptions': { bn: 'কোনো অপশন যোগ করা হয়নি', en: 'No options added yet' },
  'attributes.optionExists': { bn: 'অপশন ইতিমধ্যে যোগ করা হয়েছে', en: 'Option already added' },
  'attributes.optionReq': { bn: 'অন্তত একটি অপশন যোগ করুন', en: 'Add at least one option' },
  'attributes.updated': { bn: 'অ্যাট্রিবিউট আপডেট করা হয়েছে', en: 'Attribute updated' },
  'attributes.created': { bn: 'অ্যাট্রিবিউট তৈরি করা হয়েছে', en: 'Attribute created' },
  'attributes.deleteConfirm': { bn: 'এই অ্যাট্রিবিউট ডিলিট করবেন?', en: 'Delete this attribute?' },
  'attributes.deleted': { bn: 'অ্যাট্রিবিউট ডিলিট করা হয়েছে', en: 'Attribute deleted' },
  'attributes.noData': { bn: 'কোনো অ্যাট্রিবিউট ডিফাইন করা হয়নি।', en: 'No attributes defined yet.' },
  'attributes.example': { bn: 'উদাহরণ: অ্যাট্রিবিউট "ওজন" এর অপশন: ০.৫কেজি, ১কেজি, ২কেজি', en: 'Example: Attribute "Weight" with options: 0.5kg, 1kg, 2kg' },

  // Customers
  'customers.title': { bn: 'ক্রেতা তালিকা', en: 'Customers' },
  'customers.subtitle': { bn: 'সকল ক্রেতার তথ্য', en: 'All customer information' },
  'customers.name': { bn: 'নাম', en: 'Name' },
  'customers.phone': { bn: 'ফোন', en: 'Phone' },
  'customers.email': { bn: 'ইমেইল', en: 'Email' },
  'customers.orders': { bn: 'অর্ডার', en: 'Orders' },
  'customers.totalSpent': { bn: 'মোট ব্যয়', en: 'Total Spent' },
  'customers.lastOrder': { bn: 'সর্বশেষ অর্ডার', en: 'Last Order' },
  'customers.joined': { bn: 'যোগদান', en: 'Joined' },
  'customers.noCustomers': { bn: 'কোনো ক্রেতা নেই', en: 'No customers yet' },
  'customers.address': { bn: 'ঠিকানা', en: 'Address' },

  // Returns
  'returns.title': { bn: 'রিটার্ন রিকোয়েস্ট', en: 'Return Requests' },
  'returns.subtitle': { bn: 'ক্রেতাদের রিটার্ন অনুরোধ দেখুন এবং ব্যবস্থাপনা করুন', en: 'View and manage return requests' },
  'returns.order': { bn: 'অর্ডার #', en: 'Order #' },
  'returns.customer': { bn: 'ক্রেতা', en: 'Customer' },
  'returns.reason': { bn: 'কারণ', en: 'Reason' },
  'returns.amount': { bn: 'পরিমাণ', en: 'Amount' },
  'returns.status': { bn: 'স্ট্যাটাস', en: 'Status' },
  'returns.date': { bn: 'তারিখ', en: 'Date' },
  'returns.actions': { bn: 'অ্যাকশন', en: 'Actions' },
  'returns.noReturns': { bn: 'কোনো রিটার্ন রিকোয়েস্ট নেই', en: 'No return requests' },
  'returns.approve': { bn: 'অনুমোদন', en: 'Approve' },
  'returns.reject': { bn: 'প্রত্যাখ্যান', en: 'Reject' },
  'returns.pending': { bn: 'বিচারাধীন', en: 'Pending' },
  'returns.approved': { bn: 'অনুমোদিত', en: 'Approved' },
  'returns.rejected': { bn: 'প্রত্যাখ্যাত', en: 'Rejected' },
  'returns.refunded': { bn: 'রিফান্ড সম্পন্ন', en: 'Refunded' },

  // Users
  'users.title': { bn: 'ইউজার ব্যবস্থাপনা', en: 'Users' },
  'users.subtitle': { bn: 'সকল ইউজার দেখুন এবং ব্যবস্থাপনা করুন', en: 'View and manage users' },
  'users.email': { bn: 'ইমেইল', en: 'Email' },
  'users.name': { bn: 'নাম', en: 'Name' },
  'users.role': { bn: 'ভূমিকা', en: 'Role' },
  'users.status': { bn: 'স্ট্যাটাস', en: 'Status' },
  'users.active': { bn: 'সক্রিয়', en: 'Active' },
  'users.inactive': { bn: 'নিষ্ক্রিয়', en: 'Inactive' },
  'users.actions': { bn: 'অ্যাকশন', en: 'Actions' },
  'users.noUsers': { bn: 'কোনো ইউজার নেই', en: 'No users found' },
  'users.admin': { bn: 'অ্যাডমিন', en: 'Admin' },
  'users.businessAdmin': { bn: 'বিজনেস অ্যাডমিন', en: 'Business Admin' },
  'users.staff': { bn: 'স্টাফ', en: 'Staff' },

  // Notifications
  'notifications.title': { bn: 'নোটিফিকেশন', en: 'Notifications' },
  'notifications.subtitle': { bn: 'সকল নোটিফিকেশন দেখুন', en: 'View all notifications' },
  'notifications.title_field': { bn: 'শিরোনাম', en: 'Title' },
  'notifications.message': { bn: 'বার্তা', en: 'Message' },
  'notifications.type': { bn: 'ধরন', en: 'Type' },
  'notifications.date': { bn: 'তারিখ', en: 'Date' },
  'notifications.read': { bn: 'পড়া হয়েছে', en: 'Read' },
  'notifications.unread': { bn: 'পড়া হয়নি', en: 'Unread' },
  'notifications.noNotifications': { bn: 'কোনো নোটিফিকেশন নেই', en: 'No notifications yet' },
  'notifications.markRead': { bn: 'পড়া হয়েছে হিসেবে চিহ্নিত', en: 'Mark as Read' },
  'notifications.orderAlert': { bn: 'অর্ডার এলার্ট', en: 'Order Alert' },
  'notifications.system': { bn: 'সিস্টেম', en: 'System' },
  'notifications.promotion': { bn: 'প্রমোশন', en: 'Promotion' },

  // Landing Page
  'landing.title': { bn: 'ল্যান্ডিং পেজ', en: 'Landing Page' },
  'landing.subtitle': { bn: 'আপনার পাবলিক ল্যান্ডিং পেজ কাস্টমাইজ করুন', en: 'Customize your public landing page' },
  'landing.publish': { bn: 'প্রকাশ করুন', en: 'Publish' },
  'landing.unpublish': { bn: 'প্রকাশ বাতিল', en: 'Unpublish' },
  'landing.published': { bn: 'প্রকাশিত', en: 'Published' },
  'landing.draft': { bn: 'খসড়া', en: 'Draft' },
  'landing.slug': { bn: 'স্লাগ', en: 'Slug' },
  'landing.template': { bn: 'টেমপ্লেট', en: 'Template' },
  'landing.viewPage': { bn: 'পেজ দেখুন', en: 'View Page' },
  'landing.noPage': { bn: 'কোনো ল্যান্ডিং পেজ নেই', en: 'No landing page' },
  'landing.create': { bn: 'ল্যান্ডিং পেজ তৈরি', en: 'Create Landing Page' },

  // Settings
  'settings.title': { bn: 'সেটিংস', en: 'Settings' },
  'settings.subtitle': { bn: 'আপনার ব্যবসা এবং সিস্টেম সেটিংস কাস্টমাইজ করুন', en: 'Customize your business settings' },
  'settings.general': { bn: 'সাধারণ', en: 'General' },
  'settings.theme': { bn: 'থিম', en: 'Theme' },
  'settings.shop': { bn: 'দোকান', en: 'Shop' },
  'settings.system': { bn: 'সিস্টেম', en: 'System' },
  'settings.social': { bn: 'সোশ্যাল', en: 'Social' },
  'settings.terms': { bn: 'শর্তাবলী', en: 'Terms' },
  'settings.save': { bn: 'সংরক্ষণ করুন', en: 'Save Settings' },
  'settings.saving': { bn: 'সংরক্ষণ হচ্ছে...', en: 'Saving...' },
  'settings.saved': { bn: 'সেটিংস সংরক্ষিত হয়েছে', en: 'Settings saved' },
  'settings.companyName': { bn: 'কোম্পানির নাম', en: 'Company Name' },
  'settings.email': { bn: 'ইমেইল', en: 'Email' },
  'settings.phone': { bn: 'ফোন', en: 'Phone' },
  'settings.address': { bn: 'ঠিকানা', en: 'Address' },
  'settings.logo': { bn: 'লোগো URL', en: 'Logo URL' },
  'settings.currency': { bn: 'মুদ্রা', en: 'Currency' },
  'settings.timezone': { bn: 'টাইমজোন', en: 'Timezone' },
  'settings.tax': { bn: 'কর (%)', en: 'Tax (%)' },
  'settings.deliveryCharge': { bn: 'ডেলিভারি চার্জ', en: 'Delivery Charge' },

  // Common
  'common.loading': { bn: 'লোড হচ্ছে...', en: 'Loading...' },
  'common.error': { bn: 'সমস্যা হয়েছে', en: 'An error occurred' },
  'common.noData': { bn: 'কোনো তথ্য নেই', en: 'No data available' },
  'common.search': { bn: 'অনুসন্ধান', en: 'Search' },
  'common.filter': { bn: 'ফিল্টার', en: 'Filter' },
  'common.save': { bn: 'সংরক্ষণ', en: 'Save' },
  'common.cancel': { bn: 'বাতিল', en: 'Cancel' },
  'common.delete': { bn: 'মুছুন', en: 'Delete' },
  'common.edit': { bn: 'সম্পাদনা', en: 'Edit' },
  'common.view': { bn: 'দেখুন', en: 'View' },
  'common.add': { bn: 'যোগ করুন', en: 'Add' },
  'common.update': { bn: 'আপডেট', en: 'Update' },
  'common.back': { bn: 'পেছনে', en: 'Back' },
  'common.confirm': { bn: 'নিশ্চিত', en: 'Confirm' },
  'common.yes': { bn: 'হ্যাঁ', en: 'Yes' },
  'common.no': { bn: 'না', en: 'No' },
  'common.ok': { bn: 'ঠিক আছে', en: 'OK' },
  'common.required': { bn: 'আবশ্যক', en: 'required' },
  'common.repeat': { bn: 'পুনরাবৃত্তি', en: 'Repeat' },
  'common.rate': { bn: 'হার', en: 'Rate' },
  'common.block': { bn: 'ব্লক', en: 'Block' },
  'common.activate': { bn: 'সক্রিয়', en: 'Activate' },
  'common.select': { bn: 'নির্বাচন করুন {0}', en: 'Select {0}' },
  'common.create': { bn: 'তৈরি', en: 'Create' },
  'common.admin': { bn: 'অ্যাডমিন', en: 'Admin' },

  // Language toggle
  'lang.toggle': { bn: 'English', en: 'বাংলা' },
  'lang.label': { bn: 'ইংরেজি', en: 'বাংলা' },
};

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string, ...args: string[]) => string;
  isBn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  toggleLang: () => {},
  t: (key: string) => key,
  isBn: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('dashboardLang');
    if (saved === 'en' || saved === 'bn') setLang(saved);
  }, []);

  const toggleLang = () => {
    const next = lang === 'bn' ? 'en' : 'bn';
    setLang(next);
    localStorage.setItem('dashboardLang', next);
  };

  const t = (key: string, ...args: string[]): string => {
    let text = translations[key]?.[lang] || key;
    args.forEach((arg, i) => {
      text = text.replace(`{${i}}`, arg);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isBn: lang === 'bn' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);