import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3, MousePointerClick, Users, LogOut, ExternalLink } from "lucide-react";
import type { Visit, Click } from "@shared/schema";

interface AnalyticsStats {
  clickStats: { platform: string; count: number; url: string }[];
  visitStats: { referrer: string; count: number }[];
  totalClicks: number;
  totalVisits: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: authCheck, isLoading: authLoading } = useQuery<{ isAuthenticated: boolean }>({
    queryKey: ["/api/auth/check"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats"],
    enabled: authCheck?.isAuthenticated === true,
  });

  const { data: recentClicks } = useQuery<Click[]>({
    queryKey: ["/api/analytics/clicks"],
    enabled: authCheck?.isAuthenticated === true,
  });

  const { data: recentVisits } = useQuery<Visit[]>({
    queryKey: ["/api/analytics/visits"],
    enabled: authCheck?.isAuthenticated === true,
  });

  useEffect(() => {
    if (!authLoading && !authCheck?.isAuthenticated) {
      navigate("/admin");
    }
  }, [authCheck, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      navigate("/admin");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !authCheck?.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Panel de Análisis</h1>
            <p className="text-muted-foreground mt-1">Estadísticas de withgex</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="glass-card" data-testid="card-total-visits">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitas Totales</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-visits">
                  {stats?.totalVisits || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Personas que visitaron tu página
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card" data-testid="card-total-clicks">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clics Totales</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-clicks">
                  {stats?.totalClicks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clics en tus enlaces
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card" data-testid="card-conversion-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-conversion-rate">
                  {stats?.totalVisits
                    ? `${((stats.totalClicks / stats.totalVisits) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Visitas que hacen clic
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Clics por Plataforma</CardTitle>
              <CardDescription>Popularidad de cada red social</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stats?.clickStats && stats.clickStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.clickStats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border"
                      data-testid={`stat-platform-${stat.platform.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <ExternalLink className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{stat.platform}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {stat.url}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{stat.count}</p>
                        <p className="text-xs text-muted-foreground">clics</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de clics todavía
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Fuentes de Tráfico</CardTitle>
              <CardDescription>De dónde vienen tus visitantes</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stats?.visitStats && stats.visitStats.length > 0 ? (
                <div className="space-y-3">
                  {stats.visitStats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border"
                      data-testid={`stat-referrer-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium truncate">
                          {stat.referrer === "Direct" ? "Tráfico Directo" : stat.referrer}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="text-lg font-bold">{stat.count}</span>
                        <span className="text-xs text-muted-foreground ml-1">visitas</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de visitas todavía
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Clics Recientes</CardTitle>
              <CardDescription>Últimos clics en tus enlaces</CardDescription>
            </CardHeader>
            <CardContent>
              {recentClicks && recentClicks.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentClicks.slice(0, 10).map((click) => (
                    <div
                      key={click.id}
                      className="p-3 rounded-lg bg-card/30 border border-border text-sm"
                      data-testid={`recent-click-${click.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{click.platform}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(click.timestamp).toLocaleString("es-ES")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay clics recientes
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Visitas Recientes</CardTitle>
              <CardDescription>Últimas personas que visitaron tu página</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVisits && recentVisits.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentVisits.slice(0, 10).map((visit) => (
                    <div
                      key={visit.id}
                      className="p-3 rounded-lg bg-card/30 border border-border text-sm"
                      data-testid={`recent-visit-${visit.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium truncate">
                            {visit.referrer || "Tráfico Directo"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(visit.timestamp).toLocaleString("es-ES")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay visitas recientes
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
