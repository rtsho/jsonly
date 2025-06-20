import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getUserDocumentAnalyses, getUserDocument } from '../services/firebase';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DocumentAnalysis {
  id: string;
  documentName: string;
  runAt: string;
  nbPages: number;
}

interface UsageData {
  date: string;
  pages: number;
}

interface UserPlan {
  name: string;
  pages: number;
  price: number;
  per: string;
}

const UsagePage: React.FC = () => {
  const { user } = useAppContext();
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentMonthPages, setCurrentMonthPages] = useState<number>(0);
  const [chartData, setChartData] = useState<UsageData[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan>({
    name: 'Basic',
    pages: 0,
    price: 1.95,
    per: '/100 pages'
  });
  const [pagesRemaining, setPagesRemaining] = useState<number>(0);

  // Plans data (same as in SubscriptionPage)
  const plans = [
    {
      name: 'Basic',
      pages: 0,
      price: 1.95,
      per: '/100 pages',
    },
    {
      name: 'Pro',
      pages: 1000,
      price: 9.95,
      per: '/month',
    },
    {
      name: 'Business',
      pages: 10000,
      price: 49.95,
      per: '/month',
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user document to get plan information
        const userDoc = await getUserDocument(user.uid);
        if (userDoc) {
          const planName = userDoc.plan || 'Basic';
          const plan = plans.find(p => p.name === planName) || plans[0];
          setUserPlan(plan);
        }

        // Fetch all document analyses
        const analysesData = await getUserDocumentAnalyses(user.uid);
        setAnalyses(analysesData);

        // Calculate total pages
        const total = analysesData.reduce((sum, analysis) => sum + (analysis.nbPages || 0), 0);
        setTotalPages(total);

        // Calculate current month pages
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthAnalyses = analysesData.filter(analysis => {
          const analysisDate = new Date(analysis.runAt);
          return analysisDate >= firstDayOfMonth;
        });
        const monthTotal = currentMonthAnalyses.reduce((sum, analysis) => sum + (analysis.nbPages || 0), 0);
        setCurrentMonthPages(monthTotal);

        // Calculate pages remaining for the current plan
        if (userPlan.pages > 0) {
          setPagesRemaining(Math.max(0, userPlan.pages - monthTotal));
        } else {
          setPagesRemaining(0); // Basic plan is pay-as-you-go
        }

        // Prepare chart data (last 14 days)
        const last14Days = new Date();
        last14Days.setDate(last14Days.getDate() - 14);
        
        // Create a map for each day in the last 14 days
        const dailyUsageMap = new Map<string, number>();
        
        // Initialize with zero values for all days
        for (let i = 0; i < 14; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyUsageMap.set(dateStr, 0);
        }
        
        // Fill in actual usage data
        analysesData.forEach(analysis => {
          const analysisDate = new Date(analysis.runAt);
          if (analysisDate >= last14Days) {
            const dateStr = analysisDate.toISOString().split('T')[0];
            const currentPages = dailyUsageMap.get(dateStr) || 0;
            dailyUsageMap.set(dateStr, currentPages + (analysis.nbPages || 0));
          }
        });
        
        // Convert map to array and sort by date
        const chartDataArray: UsageData[] = Array.from(dailyUsageMap.entries())
          .map(([date, pages]) => ({ date, pages }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        setChartData(chartDataArray);
      } catch (err) {
        console.error('Error fetching usage data:', err);
        setError('Failed to load usage data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for chart
  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-white">Loading usage data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-white">Please sign in to view your usage data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">My Usage</h1>
        <p className="text-xl text-gray-300">Track your document analysis activity</p>
      </div>

      {/* Usage Summary */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Total Pages */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-2">Total Pages Processed</h3>
          <p className="text-4xl font-bold text-white">{totalPages}</p>
          <p className="text-gray-400 mt-2">Lifetime</p>
        </div>

        {/* Current Month Pages */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-2">Current Month Usage</h3>
          <p className="text-4xl font-bold text-white">{currentMonthPages}</p>
          <p className="text-gray-400 mt-2">Pages this month</p>
        </div>

        {/* Plan Info */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-2">Current Plan</h3>
          <p className="text-4xl font-bold text-white">{userPlan.name}</p>
          {userPlan.pages > 0 ? (
            <p className="text-gray-400 mt-2">
              {pagesRemaining} of {userPlan.pages} pages remaining
            </p>
          ) : (
            <p className="text-gray-400 mt-2">Pay as you go (${userPlan.price}/100 pages)</p>
          )}
        </div>
      </div>

      {/* Usage Chart - Chart.js */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-12">
        <h3 className="text-xl font-semibold text-white mb-6">Usage Over Time (Last 14 Days)</h3>
        
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No usage data available for the last 14 days.</p>
          </div>
        ) : (
          <div className="h-80"> {/* Increased height for better chart display */}
            <Bar
              data={{
                labels: chartData.map(item => formatChartDate(item.date)),
                datasets: [
                  {
                    label: 'Pages Processed',
                    data: chartData.map(item => item.pages),
                    backgroundColor: 'rgba(139, 92, 246, 0.8)', // Purple with some transparency
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: {
                      color: '#aaa', // Gray text for legend
                    },
                  },
                  title: {
                    display: false, // Title is already in h3
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += context.parsed.y + ' pages';
                        }
                        return label;
                      }
                    },
                    bodyColor: '#fff', // White text for tooltip body
                    titleColor: '#fff', // White text for tooltip title
                    backgroundColor: '#333', // Dark background for tooltip
                    borderColor: '#555', // Gray border for tooltip
                    borderWidth: 1,
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#aaa', // Gray text for x-axis labels
                      maxRotation: 45,
                      minRotation: 45,
                    },
                    grid: {
                      color: '#444', // Darker gray grid lines
                    },
                  },
                  y: {
                    ticks: {
                      color: '#aaa', // Gray text for y-axis labels
                      beginAtZero: true,
                      stepSize: 1, // Display ticks at integer intervals
                    },
                    grid: {
                      color: '#444', // Darker gray grid lines
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
        
        {analyses.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No document analyses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Pages
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {analyses.slice(0, 10).map((analysis) => (
                  <tr key={analysis.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {analysis.documentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(analysis.runAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {analysis.nbPages}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsagePage;