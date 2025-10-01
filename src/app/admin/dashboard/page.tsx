"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Users, Database, Activity, TrendingUp, Loader2, RefreshCcw, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from "clsx";

import type { User } from "@/types/user";
import type { QuotaToday, Job } from "@/types/job";

import { fetchMe, fetchMySubscription } from "@/lib/me";
import { fetchQuotaToday } from "@/lib/jobs";        
import { fetchJobs } from "@/lib/jobs";              
import { getMediaOutputTotal } from "@/lib/media";

const fmt = (n: number | undefined | null) =>
  new Intl.NumberFormat("en-US").format(Number(n ?? 0));

// Component untuk handle search params
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [me, setMe] = useState<User | null>(null);
  const [quotaToday, setQuotaToday] = useState<QuotaToday | null>(null);
  
  // Data subscription yang lebih lengkap
  const [subscription, setSubscription] = useState<any>(null);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);

  const [mediaTotal, setMediaTotal] = useState<number>(0);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  
  // Pagination untuk recent jobs
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(recentJobs.length / itemsPerPage);
  const currentJobs = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return recentJobs.slice(start, start + itemsPerPage);
  }, [recentJobs, currentPage]);

  const usedToday = useMemo(() => {
    if (!quotaToday) return 0;
    return (quotaToday.dailyLimit ?? 0) - (quotaToday.remaining ?? 0);
  }, [quotaToday]);

  async function loadAll() {
    setLoading(true);
    try {
      // Load user data dari endpoint baru
      try {
        const meData = await fetchMe();
        console.log("User data loaded:", meData);
        setMe(meData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setMe(null);
      }

      // Load subscription data dari endpoint baru
      try {
        const subData = await fetchMySubscription();
        console.log("Subscription data loaded:", subData);
        setSubscription(subData.subscription);
        setEntitlements(subData.subscription?.entitlements);
        setUsage(subData.usage);
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        setSubscription(null);
        setEntitlements(null);
        setUsage(null);
      }

      // quota weight hari ini (tetap dari endpoint lama)
      const qt = await fetchQuotaToday().catch((err) => {
        console.error("Error fetching quota:", err);
        return null;
      });
      setQuotaToday(qt);

      // total media outputs (facefusion)
      const total = await getMediaOutputTotal().catch((err) => {
        console.error("Error fetching media total:", err);
        return 0;
      });
      setMediaTotal(total);

      // recent jobs user (ambil lebih banyak untuk pagination)
      const jobs = await fetchJobs({ take: 20, skip: 0 }).catch((err) => {
        console.error("Error fetching jobs:", err);
        return [];
      });
      setRecentJobs(jobs);
      setCurrentPage(0); // reset ke halaman pertama
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {me?.displayName ?? "User"}</h1>
          <p className="text-muted-foreground">
            {me?.email} • Role: <span className="uppercase">{me?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Admin</Badge>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.planName ? subscription.planName : "Free Plan"}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.planCode && `Code: ${subscription.planCode}`}
            </p>
            <div className={clsx(
              "inline-block px-2 py-1 rounded text-xs mt-2",
              subscription?.status === "ACTIVE" 
                ? "bg-green-600/20 text-green-300" 
                : "bg-orange-600/20 text-orange-300"
            )}>
              {subscription?.status || "No Subscription"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Weight Quota</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fmt(quotaToday?.remaining)}
            </div>
            <p className="text-xs text-muted-foreground">
              Used today: {fmt(usedToday)}
            </p>
            <div className="mt-3 h-2 bg-muted rounded overflow-hidden">
              <div
                className={clsx(
                  "h-full transition-all",
                  (quotaToday?.remaining ?? 0) > 0 ? "bg-green-500" : "bg-red-500"
                )}
                style={{
                  width: `${
                    Math.min(
                      100,
                      ((quotaToday?.dailyLimit ?? 0) === 0
                        ? 0
                        : (usedToday / (quotaToday?.dailyLimit ?? 1)) * 100)
                    ).toFixed(1)
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fmt(mediaTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Face fusion outputs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Limits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Concurrency:</span>
                <span>{entitlements?.concurrency || 1}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Max Video:</span>
                <span>{entitlements?.max_video_sec || 30}s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Resolution:</span>
                <span>{entitlements?.max_resolution || "720p"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>
              Distribution of job statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['SUCCEEDED', 'FAILED', 'RUNNING', 'QUEUED'].map(status => {
                const count = recentJobs.filter(j => j.status === status).length;
                const percentage = recentJobs.length > 0 ? (count / recentJobs.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-muted-foreground">{status}</div>
                    <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                      <div
                        className={clsx(
                          "h-full transition-all",
                          status === "SUCCEEDED" && "bg-green-500",
                          status === "FAILED" && "bg-red-500",
                          status === "RUNNING" && "bg-blue-500",
                          status === "QUEUED" && "bg-yellow-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-xs text-muted-foreground">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Processors</CardTitle>
            <CardDescription>
              Top processor usage distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  
                  {(() => {
                    const processorCounts = recentJobs.reduce((acc, job) => {
                      if (Array.isArray(job.processors)) {
                        job.processors.forEach(proc => {
                          acc[proc] = (acc[proc] || 0) + 1;
                        });
                      }
                      return acc;
                    }, {} as Record<string, number>);

                    const totalUsage = Object.values(processorCounts).reduce((sum, count) => sum + count, 0);
                    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
                    
                    let cumulativePercentage = 0;
                    const circumference = 2 * Math.PI * 40;

                    return Object.entries(processorCounts)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([processor, count], index) => {
                        const percentage = totalUsage > 0 ? count / totalUsage : 0;
                        const strokeDasharray = `${percentage * circumference} ${circumference}`;
                        const strokeDashoffset = -cumulativePercentage * circumference;
                        cumulativePercentage += percentage;

                        return (
                          <circle
                            key={processor}
                            cx="60"
                            cy="60"
                            r="40"
                            fill="none"
                            stroke={colors[index]}
                            strokeWidth="8"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        );
                      });
                  })()}
                </svg>
              </div>
            </div>
            
            <div className="space-y-1">
              {(() => {
                const processorCounts = recentJobs.reduce((acc, job) => {
                  if (Array.isArray(job.processors)) {
                    job.processors.forEach(proc => {
                      acc[proc] = (acc[proc] || 0) + 1;
                    });
                  }
                  return acc;
                }, {} as Record<string, number>);

                const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
                
                return Object.entries(processorCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([processor, count], index) => (
                    <div key={processor} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[index] }}
                        />
                        <span className="text-sm truncate max-w-24" title={processor}>
                          {processor.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({((count / Object.values(processorCounts).reduce((sum, c) => sum + c, 0)) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ));
              })()}
              
              {recentJobs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">No processor data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>
                Latest user job activities
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push('/admin/explore')}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-3 pr-4">Job ID</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Processors</th>
                  <th className="text-left py-3 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No recent jobs found.
                    </td>
                  </tr>
                ) : (
                  currentJobs.map((j) => (
                    <tr key={j.id} className="border-b">
                      <td className="py-3 pr-4 font-mono text-xs">{j.id.substring(0, 8)}...</td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            j.status === "SUCCEEDED" ? "default" :
                            j.status === "FAILED" ? "destructive" :
                            j.status === "RUNNING" ? "secondary" : "outline"
                          }
                        >
                          {j.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 truncate max-w-32">
                        {Array.isArray(j.processors) ? j.processors.join(", ") : "-"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(j.createdAt ?? "").toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages} ({recentJobs.length} total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="outline"
            onClick={() => router.push('/admin/user')}
            className="justify-start"
          >
            Manage Users
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/admin/library')}
            className="justify-start"
          >
            View Media Library
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/admin/subscription')}
            className="justify-start"
          >
            Subscription Management
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/admin/feature')}
            className="justify-start"
          >
            Feature Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component
function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main component dengan Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}