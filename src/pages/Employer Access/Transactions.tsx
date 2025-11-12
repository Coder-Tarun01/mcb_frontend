import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EmployerLayout from '../../components/employer/EmployerLayout';

interface Transaction {
  orderId: string;
  type: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'pending' | 'successful' | 'failed';
}

type SortField = 'orderId' | 'type' | 'amount' | 'date' | 'paymentMethod' | 'status';
type SortDirection = 'asc' | 'desc';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { user, isEmployer } = useAuth();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    if (!user || !isEmployer()) {
      navigate('/login');
      return;
    }
  }, [user, navigate, isEmployer]);

  const transactions = useMemo<Transaction[]>(() => [
    {
      orderId: '#123',
      type: 'Social Media Expert',
      amount: 99.00,
      date: 'Dec 15, 2024',
      paymentMethod: 'PayPal',
      status: 'pending'
    },
    {
      orderId: '#456',
      type: 'Web Designer',
      amount: 199.00,
      date: 'Nov 10, 2024',
      paymentMethod: 'Bank Transfer',
      status: 'pending'
    },
    {
      orderId: '#789',
      type: 'Finance Accountant',
      amount: 299.00,
      date: 'Oct 5, 2024',
      paymentMethod: 'PayPal',
      status: 'pending'
    },
    {
      orderId: '#101',
      type: 'Social Media Expert',
      amount: 399.00,
      date: 'Dec 15, 2024',
      paymentMethod: 'Bank Transfer',
      status: 'successful'
    },
    {
      orderId: '#202',
      type: 'UI/UX Designer',
      amount: 249.00,
      date: 'Nov 28, 2024',
      paymentMethod: 'Credit Card',
      status: 'successful'
    },
    {
      orderId: '#303',
      type: 'Backend Developer',
      amount: 449.00,
      date: 'Nov 15, 2024',
      paymentMethod: 'PayPal',
      status: 'failed'
    },
    {
      orderId: '#404',
      type: 'Digital Marketer',
      amount: 179.00,
      date: 'Oct 22, 2024',
      paymentMethod: 'Bank Transfer',
      status: 'successful'
    },
    {
      orderId: '#505',
      type: 'Data Analyst',
      amount: 329.00,
      date: 'Oct 8, 2024',
      paymentMethod: 'Credit Card',
      status: 'pending'
    },
    {
      orderId: '#606',
      type: 'Product Manager',
      amount: 599.00,
      date: 'Sep 30, 2024',
      paymentMethod: 'PayPal',
      status: 'successful'
    },
    {
      orderId: '#707',
      type: 'Content Writer',
      amount: 149.00,
      date: 'Sep 18, 2024',
      paymentMethod: 'Bank Transfer',
      status: 'failed'
    },
    {
      orderId: '#808',
      type: 'Mobile Developer',
      amount: 399.00,
      date: 'Sep 5, 2024',
      paymentMethod: 'Credit Card',
      status: 'successful'
    },
    {
      orderId: '#909',
      type: 'DevOps Engineer',
      amount: 499.00,
      date: 'Aug 25, 2024',
      paymentMethod: 'PayPal',
      status: 'pending'
    }
  ], []);

  // Get unique values for filter dropdowns
  const paymentMethods = Array.from(new Set(transactions.map(t => t.paymentMethod)));
  const statuses = Array.from(new Set(transactions.map(t => t.status)));

  // Filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.paymentMethod === paymentMethodFilter;
      
      return matchesSearch && matchesStatus && matchesPaymentMethod;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (sortField === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, searchTerm, statusFilter, paymentMethodFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportTransactions = () => {
    // Simulate export functionality
    console.log('Exporting transactions...');
    // In a real app, this would generate CSV/PDF
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-500 transition-all duration-200" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-500 transition-all duration-200" /> : 
      <ArrowDown className="w-4 h-4 text-blue-500 transition-all duration-200" />;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'successful': return 'bg-green-100 text-green-800 border border-green-300';
      case 'failed': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <EmployerLayout>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-7xl w-full mx-auto border border-gray-200"
        >
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-5 relative">
          <button 
            onClick={() => navigate('/employer/dashboard')} 
            className="flex items-center gap-2 bg-none border-none text-gray-500 text-sm sm:text-15 font-medium cursor-pointer transition-all duration-300 z-10 hover:text-blue-500 hover:-translate-x-1 sm:absolute sm:left-0 sm:top-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex-1 text-center w-full flex justify-center items-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 m-0 leading-tight tracking-tight">
              Transaction History
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Search and Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="relative flex-1 w-full sm:max-w-lg">
                <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Type, or Status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 sm:py-4 px-4 sm:px-5 pl-10 sm:pl-11 border-2 border-slate-200/80 rounded-xl text-sm sm:text-15 text-slate-800 bg-white/90 backdrop-blur-sm transition-all duration-300 font-medium shadow-sm hover:border-blue-400/40 hover:shadow-md hover:shadow-blue-500/8 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/15 focus:bg-white focus:-translate-y-0.5 placeholder:text-slate-400 placeholder:font-normal placeholder:italic"
                />
              </div>
              <button 
                onClick={handleExportTransactions} 
                className="flex items-center justify-center gap-2 sm:gap-2.5 bg-blue-500 !text-white border-none rounded-xl py-3 sm:py-4 px-4 sm:px-6 font-bold text-sm sm:text-15 cursor-pointer transition-all duration-300 whitespace-nowrap shadow-lg shadow-blue-500/30 tracking-tight hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 !text-white" />
                <span className="!text-white">Export</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex flex-col gap-2.5 flex-1 w-full">
                <label className="text-sm sm:text-15 font-semibold text-slate-700 mb-0.5 tracking-tight">
                  Status
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-3 px-4 pl-10 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  >
                    <option value="all">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 flex-1 w-full">
                <label className="text-sm sm:text-15 font-semibold text-slate-700 mb-0.5 tracking-tight">
                  Payment Method
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full py-3 px-4 pl-10 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  >
                    <option value="all">All Methods</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transaction Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm"
          >
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="min-w-max w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th 
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer transition-all duration-200 select-none text-center align-middle hover:bg-blue-100 hover:text-blue-500"
                        onClick={() => handleSort('orderId')}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          <span className="whitespace-nowrap">Order ID</span>
                          <span className="flex-shrink-0">{getSortIcon('orderId')}</span>
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer transition-all duration-200 select-none text-center align-middle hover:bg-blue-100 hover:text-blue-500"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          <span className="whitespace-nowrap">Type</span>
                          <span className="flex-shrink-0">{getSortIcon('type')}</span>
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer transition-all duration-200 select-none text-center align-middle hover:bg-blue-100 hover:text-blue-500"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          <span className="whitespace-nowrap">Amount</span>
                          <span className="flex-shrink-0">{getSortIcon('amount')}</span>
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer transition-all duration-200 select-none text-center align-middle hover:bg-blue-100 hover:text-blue-500"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          <span className="whitespace-nowrap">Date</span>
                          <span className="flex-shrink-0">{getSortIcon('date')}</span>
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer transition-all duration-200 select-none text-center align-middle hover:bg-blue-100 hover:text-blue-500"
                        onClick={() => handleSort('paymentMethod')}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          <span className="whitespace-nowrap">Payment Method</span>
                          <span className="flex-shrink-0">{getSortIcon('paymentMethod')}</span>
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer transition-all duration-200 select-none text-center align-middle hover:bg-blue-100 hover:text-blue-500"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                          <span className="whitespace-nowrap">Status</span>
                          <span className="flex-shrink-0">{getSortIcon('status')}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {paginatedTransactions.map((transaction, index) => (
                      <tr 
                        key={transaction.orderId} 
                        className={`border-b border-slate-200 transition-all duration-200 hover:bg-slate-50 ${index % 2 === 1 ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white'}`}
                      >
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs text-center align-middle">
                          <span className="font-mono font-semibold text-blue-500 bg-blue-100 py-1 px-2 rounded whitespace-nowrap">
                            {transaction.orderId}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs text-gray-700 text-center align-middle">
                          <span className="font-medium truncate block mx-auto">
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs text-center align-middle">
                          <span className="font-semibold font-mono text-green-600 whitespace-nowrap">
                            {formatAmount(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs text-gray-500 font-medium text-center align-middle whitespace-nowrap">
                          {transaction.date}
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs text-gray-600 font-medium text-center align-middle">
                          <span className="truncate block mx-auto">
                            {transaction.paymentMethod}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center align-middle">
                          <span className={`py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-xs font-semibold text-center uppercase tracking-wider whitespace-nowrap inline-block ${getStatusBadgeClass(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAndSortedTransactions.length === 0 && (
                <div className="text-center py-12 sm:py-16 lg:py-20 px-4 sm:px-5 text-slate-500 bg-gradient-to-br from-slate-50/80 to-slate-100/60 rounded-2xl backdrop-blur-sm">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4 sm:mb-5 bg-slate-100/10 p-3 sm:p-4 rounded-2xl" />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-700 m-0 mb-2 sm:mb-3 tracking-tight">
                    No transactions found
                  </h3>
                  <p className="text-sm sm:text-15 m-0 font-medium">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-slate-200/60 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 sm:w-25 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 py-2.5 sm:py-3 px-4 sm:px-5 bg-slate-50/80 text-slate-500 border-2 border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 backdrop-blur-sm hover:bg-slate-50/95 hover:border-slate-400/40 hover:text-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform duration-300" />
                  <span>Prev</span>
                </button>

                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mx-2 sm:mx-5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-slate-50/80 text-black border-2 border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 backdrop-blur-sm hover:bg-slate-50/95 hover:border-slate-400/40 hover:text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/15 ${currentPage === page ? 'bg-blue-500 text-black border-transparent shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:text-black hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 py-2.5 sm:py-3 px-4 sm:px-5 bg-slate-50/80 text-slate-500 border-2 border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-300 backdrop-blur-sm hover:bg-slate-50/95 hover:border-slate-400/40 hover:text-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300" />
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-4 sm:mt-5 text-center px-2">
              <p className="text-xs sm:text-sm lg:text-15 text-slate-500 m-0 font-medium bg-slate-100/5 py-2 sm:py-3 px-3 sm:px-5 rounded-xl inline-block">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} transactions
              </p>
            </div>
          </motion.div>
        </div>
        </motion.div>
      </div>
    </EmployerLayout>
  );
};

export default Transactions;
