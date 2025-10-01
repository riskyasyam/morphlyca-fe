"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Database, Activity, TrendingUp } from 'lucide-react';

// Component untuk handle search params
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMedia: 0,
    todayUsage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        // Mock data for now - replace with actual API calls
        setStats({
          totalUsers: 1250,
          activeUsers: 89,
          totalMedia: 45230,
          todayUsage: 156
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Morphlyca Admin Dashboard
          </p>
        </div>
        <Badge variant="secondary">Admin</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalMedia.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.todayUsage}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest user activities and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New user registration
                  </p>
                  <p className="text-sm text-muted-foreground">
                    john.doe@example.com joined 2 minutes ago
                  </p>
                </div>
                <div className="ml-auto font-medium">+1</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Media processing completed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Face fusion job #12345 finished
                  </p>
                </div>
                <div className="ml-auto font-medium">✓</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    System backup
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Daily backup completed successfully
                  </p>
                </div>
                <div className="ml-auto font-medium">✓</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button 
              onClick={() => router.push('/admin/user')}
              className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
            >
              Manage Users
            </button>
            <button 
              onClick={() => router.push('/admin/library')}
              className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
            >
              View Media Library
            </button>
            <button 
              onClick={() => router.push('/admin/subscription')}
              className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
            >
              Subscription Management
            </button>
            <button 
              onClick={() => router.push('/admin/feature')}
              className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
            >
              Feature Settings
            </button>
          </CardContent>
        </Card>
      </div>
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