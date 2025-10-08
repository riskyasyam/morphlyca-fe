"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, 
  Activity, 
  Users, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Eye,
  BarChart3,
  Calendar,
  Zap
} from "lucide-react";
import {
  fetchSummaryAnalytics,
  fetchProcessorAnalytics,
  fetchUserAnalytics,
  fetchUserJobs,
  type SummaryAnalyticsResponse,
  type ProcessorAnalyticsResponse,
  type UserAnalyticsResponse,
  type UserJobsResponse,
  type UserStats
} from "@/lib/admin-jobs";

export default function AdminHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryAnalyticsResponse | null>(null);
  const [processorData, setProcessorData] = useState<ProcessorAnalyticsResponse | null>(null);
  const [usersData, setUsersData] = useState<UserAnalyticsResponse | null>(null);
  const [selectedUserJobs, setSelectedUserJobs] = useState<UserJobsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [days, setDays] = useState(30);
  const [loadingUserJobs, setLoadingUserJobs] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [summary, processors, users] = await Promise.all([
        fetchSummaryAnalytics(days),
        fetchProcessorAnalytics(days),
        fetchUserAnalytics(days, 20)
      ]);
      
      setSummaryData(summary);
      setProcessorData(processors);
      setUsersData(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadUserJobs = async (userId: string) => {
    try {
      setLoadingUserJobs(true);
      const userJobs = await fetchUserJobs(userId, 1, 10);
      setSelectedUserJobs(userJobs);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load user jobs");
    } finally {
      setLoadingUserJobs(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      year: "numeric", month: "short", day: "numeric", 
      hour: "2-digit", minute: "2-digit",
    });

  const getStatusBadge = (status: string) => {
    const variants = {
      SUCCEEDED: "bg-green-600/20 text-green-300",
      FAILED: "bg-red-600/20 text-red-300",
      RUNNING: "bg-blue-600/20 text-blue-300",
      QUEUED: "bg-yellow-600/20 text-yellow-300",
    };
    return variants[status as keyof typeof variants] || "bg-gray-600/20 text-gray-300";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "FAILED": return <XCircle className="w-4 h-4 text-red-400" />;
      case "RUNNING": return <Play className="w-4 h-4 text-blue-400" />;
      case "QUEUED": return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const calculateDuration = (startedAt?: string, finishedAt?: string) => {
    if (!startedAt || !finishedAt) return "-";
    const duration = (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000;
    return `${Math.round(duration)}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs History & Analytics</h1>
          <p className="text-gray-400">Monitor platform activity and job analytics</p>
        </div>
        
        <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Jobs</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryData.overview.recentJobs.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">
                {summaryData.overview.totalJobsAllTime.toLocaleString()} all time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryData.overview.uniqueActiveUsers}
              </div>
              <p className="text-xs text-gray-400">
                Last {days} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summaryData.overview.successRate}%
              </div>
              <p className="text-xs text-gray-400">
                Overall platform success
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Job Status</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">Success</span>
                  <span className="text-white">{summaryData.statusDistribution.succeeded}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">Failed</span>
                  <span className="text-white">{summaryData.statusDistribution.failed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-400">Running</span>
                  <span className="text-white">{summaryData.statusDistribution.running}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processor Analytics */}
      {processorData && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-yellow-400" />
              Processor Analytics
            </CardTitle>
            <CardDescription className="text-gray-400">
              Most popular processors and their performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Processor</TableHead>
                    <TableHead className="text-gray-300">Usage Count</TableHead>
                    <TableHead className="text-gray-300">Success Rate</TableHead>
                    <TableHead className="text-gray-300">Unique Users</TableHead>
                    <TableHead className="text-gray-300">Avg Weight</TableHead>
                    <TableHead className="text-gray-300">Total Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processorData.processors.map((processor) => (
                    <TableRow key={processor.name} className="border-gray-700 hover:bg-gray-800">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          {processor.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{processor.count}</TableCell>
                      <TableCell>
                        <Badge className={`${Number(processor.successRate) >= 95 ? 'bg-green-600/20 text-green-300' : 
                          Number(processor.successRate) >= 90 ? 'bg-yellow-600/20 text-yellow-300' : 'bg-red-600/20 text-red-300'}`}>
                          {processor.successRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{processor.uniqueUsers}</TableCell>
                      <TableCell className="text-gray-300">{processor.avgWeight}</TableCell>
                      <TableCell className="text-gray-300">{processor.totalWeight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Activity */}
      {usersData && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-green-400" />
              Most Active Users
            </CardTitle>
            <CardDescription className="text-gray-400">
              Top users by job activity in the last {days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Total Jobs</TableHead>
                    <TableHead className="text-gray-300">Success Rate</TableHead>
                    <TableHead className="text-gray-300">Total Weight</TableHead>
                    <TableHead className="text-gray-300">Member Since</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.users.map((userStats) => (
                    <TableRow key={userStats.user.id} className="border-gray-700 hover:bg-gray-800">
                      <TableCell className="font-medium text-white">
                        {userStats.user.displayName}
                      </TableCell>
                      <TableCell className="text-gray-300">{userStats.user.email}</TableCell>
                      <TableCell className="text-gray-300">{userStats.stats.totalJobs}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(Number(userStats.stats.successRate) >= 95 ? 'SUCCEEDED' : 'FAILED')}>
                          {userStats.stats.successRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{userStats.stats.totalWeight}</TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(userStats.user.memberSince)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-gray-800"
                              onClick={() => loadUserJobs(userStats.user.id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Jobs
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-4xl bg-gray-900 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Jobs History - {userStats.user.displayName}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Recent job activity for {userStats.user.email}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            
                            <div className="max-h-96 overflow-y-auto">
                              {loadingUserJobs ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                                </div>
                              ) : selectedUserJobs ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-gray-700">
                                      <TableHead className="text-gray-300">Job ID</TableHead>
                                      <TableHead className="text-gray-300">Status</TableHead>
                                      <TableHead className="text-gray-300">Processors</TableHead>
                                      <TableHead className="text-gray-300">Weight</TableHead>
                                      <TableHead className="text-gray-300">Created</TableHead>
                                      <TableHead className="text-gray-300">Duration</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedUserJobs.jobs.map((job) => (
                                      <TableRow key={job.id} className="border-gray-700">
                                        <TableCell className="font-mono text-sm text-gray-300">
                                          {job.id.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            {getStatusIcon(job.status)}
                                            <Badge className={getStatusBadge(job.status)}>
                                              {job.status}
                                            </Badge>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex flex-wrap gap-1">
                                            {job.processors.map((proc) => (
                                              <Badge key={proc} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                                {proc}
                                              </Badge>
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-gray-300">{job.weightUsed}</TableCell>
                                        <TableCell className="text-gray-300">
                                          {formatDate(job.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                          {calculateDuration(job.startedAt, job.finishedAt)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : null}
                            </div>
                            
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                                Close
                              </AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
