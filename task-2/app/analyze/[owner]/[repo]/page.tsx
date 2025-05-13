"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { formatDistance, subWeeks, format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  html_url: string;
}

interface WeeklyData {
  weekLabel: string;
  startDate: Date;
  endDate: Date;
  created: number;
  closed: number;
  openAtStart: number;
  closureRate: number;
}

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const [repoName, setRepoName] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [statusCount, setStatusCount] = useState({ open: 0, closed: 0 });
  const [averageClosureRate, setAverageClosureRate] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"created_at" | "number">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (params.owner && params.repo) {
      const owner = params.owner as string;
      const repo = params.repo as string;
      const fullRepo = `${owner}/${repo}`;
      setRepoName(fullRepo);
      fetchIssues(fullRepo);
    }
  }, [params.owner, params.repo]);

  useEffect(() => {
    if (issues.length > 0) {
      const filtered = issues.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const sorted = [...filtered].sort((a, b) => {
        if (sortField === "created_at") {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          return sortOrder === "asc" ? a.number - b.number : b.number - a.number;
        }
      });
      
      setFilteredIssues(sorted);
    }
  }, [issues, searchTerm, sortField, sortOrder]);

  const fetchIssues = async (repo: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      const allIssues: Issue[] = [];
      
      // GitHub API allows max 100 items per page, so we need to paginate
      for (let page = 1; page <= 10; page++) {
        const response = await axios.get(
          `https://api.github.com/repos/${repo}/issues`, {
            params: {
              state: "all",
              per_page: 100,
              page: page,
            },
            headers: {
              Accept: "application/vnd.github.v3+json",
              Authorization: process.env.NEXT_PUBLIC_GITHUB_TOKEN 
                ? `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
                : undefined,
            }
          }
        );
        
        // GitHub's issues endpoint also returns pull requests, so we filter them out
        const issuesOnly = response.data.filter((item: any) => !item.pull_request);
        allIssues.push(...issuesOnly);
        
        // If we got fewer than 100 issues, we've reached the end
        if (response.data.length < 100) break;
        
        // If we've collected 1000 issues, stop (as per requirements)
        if (allIssues.length >= 1000) break;
      }
      
      setIssues(allIssues);
      processIssuesData(allIssues);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to fetch issues. Please check the repository name and try again.");
      setIsLoading(false);
    }
  };

  const processIssuesData = (issuesList: Issue[]) => {
    // Count open and closed issues
    const open = issuesList.filter(issue => issue.state === "open").length;
    const closed = issuesList.length - open;
    setStatusCount({ open, closed });
    
    // Process weekly data for the last 10 weeks
    const currentDate = new Date();
    const weeklyDataArray: WeeklyData[] = [];
    
    // Generate data for each of the last 10 weeks
    for (let i = 9; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(currentDate, i));
      const weekEnd = endOfWeek(subWeeks(currentDate, i));
      
      // Count issues created in this week
      const createdThisWeek = issuesList.filter(issue => {
        const createdDate = new Date(issue.created_at);
        return createdDate >= weekStart && createdDate <= weekEnd;
      }).length;
      
      // Count issues closed in this week
      const closedThisWeek = issuesList.filter(issue => {
        if (!issue.closed_at) return false;
        const closedDate = new Date(issue.closed_at);
        return closedDate >= weekStart && closedDate <= weekEnd;
      }).length;
      
      // Count issues open at the start of the week
      const openAtStart = issuesList.filter(issue => {
        const createdDate = new Date(issue.created_at);
        const closedDate = issue.closed_at ? new Date(issue.closed_at) : null;
        
        return (
          createdDate < weekStart && 
          (!closedDate || closedDate >= weekStart)
        );
      }).length;
      
      // Calculate closure rate
      // Weekly Closure Rate = Issues closed during the week / (Issues open at start of week + Issues created during the week)
      const denominator = openAtStart + createdThisWeek;
      const closureRate = denominator > 0 ? closedThisWeek / denominator : 0;
      
      weeklyDataArray.push({
        weekLabel: format(weekStart, 'MMM d'),
        startDate: weekStart,
        endDate: weekEnd,
        created: createdThisWeek,
        closed: closedThisWeek,
        openAtStart,
        closureRate: Math.round(closureRate * 100) / 100, // Round to 2 decimal places
      });
    }
    
    setWeeklyData(weeklyDataArray);
    
    // Calculate average closure rate
    const totalClosureRate = weeklyDataArray.reduce((sum, week) => sum + week.closureRate, 0);
    const avgClosureRate = totalClosureRate / weeklyDataArray.length;
    setAverageClosureRate(Math.round(avgClosureRate * 100) / 100); // Round to 2 decimal places
  };

  const handleSort = (field: "created_at" | "number") => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to descending
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-700">Fetching issues from {repoName}...</p>
            <p className="mt-2 text-sm text-gray-500">This may take a moment to retrieve up to 1000 issues.</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">{error}</div>
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {repoName}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Analyzed {issues.length} issues
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button 
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View All Issues
                  </button>
                </div>
              </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Status count card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Issue Status</h2>
                <div className="flex items-center justify-center h-64">
                  <Pie 
                    data={{
                      labels: ['Open', 'Closed'],
                      datasets: [
                        {
                          data: [statusCount.open, statusCount.closed],
                          backgroundColor: ['#3b82f6', '#10b981'],
                          borderColor: ['#2563eb', '#059669'],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = statusCount.open + statusCount.closed;
                              const percentage = Math.round((value as number / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700">Open Issues</p>
                    <p className="text-2xl font-bold text-blue-800">{statusCount.open}</p>
                  </div>
                  <div className="text-center p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700">Closed Issues</p>
                    <p className="text-2xl font-bold text-green-800">{statusCount.closed}</p>
                  </div>
                </div>
              </div>
              
              {/* Week-wise issue count card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Weekly Issue Activity</h2>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: weeklyData.map(week => week.weekLabel),
                      datasets: [
                        {
                          label: 'Created',
                          data: weeklyData.map(week => week.created),
                          backgroundColor: '#3b82f6',
                        },
                        {
                          label: 'Closed',
                          data: weeklyData.map(week => week.closed),
                          backgroundColor: '#10b981',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          stacked: false,
                        },
                        y: {
                          stacked: false,
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700">Total Created</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {weeklyData.reduce((sum, week) => sum + week.created, 0)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700">Total Closed</p>
                    <p className="text-2xl font-bold text-green-800">
                      {weeklyData.reduce((sum, week) => sum + week.closed, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Weekly closure rate card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Weekly Closure Rate</h2>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: weeklyData.map(week => week.weekLabel),
                      datasets: [
                        {
                          label: 'Closure Rate',
                          data: weeklyData.map(week => week.closureRate),
                          borderColor: '#8b5cf6',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          tension: 0.1,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 1,
                          ticks: {
                            callback: function(value) {
                              return (value as number * 100).toFixed(0) + '%';
                            }
                          }
                        },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Closure Rate: ${(context.raw as number * 100).toFixed(0)}%`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-700">Average Closure Rate</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {(averageClosureRate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-indigo-100 rounded-lg">
                    <p className="text-sm text-indigo-700">Highest Week</p>
                    <p className="text-2xl font-bold text-indigo-800">
                      {(Math.max(...weeklyData.map(w => w.closureRate)) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* New vs Closed issues ratio card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">New vs Closed Issues Ratio</h2>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: weeklyData.map(week => week.weekLabel),
                      datasets: [
                        {
                          label: 'Ratio (Created:Closed)',
                          data: weeklyData.map(week => 
                            week.closed > 0 ? week.created / week.closed : week.created > 0 ? 3 : 1
                          ),
                          backgroundColor: weeklyData.map(week => 
                            week.created > week.closed ? '#ef4444' : '#10b981'
                          ),
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 3,
                          ticks: {
                            callback: function(value) {
                              if (value === 1) return 'Equal';
                              if (value === 0) return '0';
                              if (value > 1) return `${value}:1`;
                              return `1:${Math.round(1 / (value as number))}`;
                            }
                          }
                        },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const week = weeklyData[context.dataIndex];
                              return `Created: ${week.created}, Closed: ${week.closed}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-orange-100 rounded-lg">
                    <p className="text-sm text-orange-700">Weeks Above 1:1</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {weeklyData.filter(w => w.created > w.closed).length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-teal-100 rounded-lg">
                    <p className="text-sm text-teal-700">Weeks Below 1:1</p>
                    <p className="text-2xl font-bold text-teal-800">
                      {weeklyData.filter(w => w.created <= w.closed && w.closed > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal for viewing all issues */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">All Issues ({filteredIssues.length})</h2>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-4 border-b">
                    <input
                      type="text"
                      placeholder="Search issues by title..."
                      className="w-full px-4 py-2 border rounded-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="overflow-auto flex-1">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort("number")}>
                            # {sortField === "number" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleSort("created_at")}>
                            Created {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Closed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredIssues.map(issue => (
                          <tr key={issue.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-500">
                              <a 
                                href={issue.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                #{issue.number}
                              </a>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <a 
                                href={issue.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {issue.title}
                              </a>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                issue.state === 'open' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {issue.state}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {format(new Date(issue.created_at), 'MMM d, yyyy')}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {issue.closed_at 
                                ? format(new Date(issue.closed_at), 'MMM d, yyyy')
                                : '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 