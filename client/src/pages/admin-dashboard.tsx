import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
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

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const periodOptions = [
    { value: "7", label: "Última semana (7 días)" },
    { value: "28", label: "Último mes (28 días)" },
    { value: "60", label: "Últimos 2 meses (60 días)" },
    { value: "365", label: "Último año (365 días)" }
  ];

  // Función para actualizar datos manualmente
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Obtener datos de usuarios y entradas
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["users-analytics", selectedPeriod, refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/users?days=${selectedPeriod}`);
      if (!response.ok) throw new Error("Error al obtener datos de usuarios");
      return response.json();
    },
  });

  // Obtener datos de entradas totales (visitas)
  const { data: visitsData, isLoading: visitsLoading, refetch: refetchVisits } = useQuery({
    queryKey: ["visits-analytics", selectedPeriod, refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/stats?days=${selectedPeriod}`);
      if (!response.ok) throw new Error("Error al obtener datos de visitas");
      return response.json();
    },
  });

  // Obtener datos de clics en redes sociales
  const { data: clicksData, isLoading: clicksLoading, refetch: refetchClicks } = useQuery({
    queryKey: ["clicks-analytics", refreshKey],
    queryFn: async () => {
      const response = await fetch("/api/analytics/clicks");
      if (!response.ok) throw new Error("Error al obtener datos de clics");
      return response.json();
    },
  });

  // Obtener datos de clics por día
  const { data: clicksByDayData, isLoading: clicksByDayLoading, refetch: refetchClicksByDay } = useQuery({
    queryKey: ["clicks-by-day-analytics", selectedPeriod, refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/clicks-by-day?days=${selectedPeriod}`);
      if (!response.ok) throw new Error("Error al obtener datos de clics por día");
      return response.json();
    },
  });

  // Función para actualizar todos los datos
  const handleRefreshAll = async () => {
    await Promise.all([refetchUsers(), refetchVisits(), refetchClicks(), refetchClicksByDay()]);
    handleRefresh();
  };

  // Función para calcular porcentaje de cambio
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        window.location.href = "/admin-login";
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para exportar datos
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&days=${selectedPeriod}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al exportar datos:", error);
    }
  };

  // Función para limpiar datos antiguos
  const handleCleanup = async () => {
    try {
      const response = await fetch("/api/analytics/cleanup", { method: "POST" });
      if (response.ok) {
        const result = await response.json();
        alert(`Limpieza completada: ${result.deletedVisits} visitas y ${result.deletedClicks} clics eliminados`);
        handleRefreshAll();
      }
    } catch (error) {
      console.error("Error al limpiar datos:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Panel de Análisis</h1>
            <h2 className="text-xl text-gray-600">Estadísticas de withgex</h2>
            <p className="text-sm text-gray-500 mt-2">• Última actualización: {currentDate}</p>
          </div>
          
          {/* Controles expandidos */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Primera fila de controles */}
            <div className="flex items-center gap-4">
              {/* Selector de período más ancho */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Período:</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botón de actualizar */}
              <Button 
                onClick={handleRefreshAll}
                variant="outline" 
                className="flex items-center gap-2"
                disabled={usersLoading || visitsLoading || clicksLoading}
              >
                <RefreshCw className={`h-4 w-4 ${(usersLoading || visitsLoading || clicksLoading) ? 'animate-spin' : ''}`} />
                {(usersLoading || visitsLoading || clicksLoading) ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
            
            {/* Segunda fila de controles */}
            <div className="flex items-center gap-2">
              {/* Botones de exportar */}
              <Button 
                onClick={() => handleExport('csv')}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              
              <Button 
                onClick={() => handleExport('json')}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                JSON
              </Button>
              
              {/* Botón de limpiar datos */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Limpiar datos antiguos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esto eliminará permanentemente todos los datos más antiguos de 1 año. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCleanup}>
                      Limpiar datos
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              {/* Botón de cerrar sesión */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                    <LogOut className="h-4 w-4" />
                    Salir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que quieres cerrar tu sesión?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Cerrar sesión
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        
        {/* Tarjeta de Estadísticas Generales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Estadísticas Generales ({periodOptions.find(p => p.value === selectedPeriod)?.label.toLowerCase()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading || visitsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500 text-lg">Cargando datos...</div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Usuarios Únicos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {usersData?.totalUniqueUsers || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">visitantes identificados</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Entradas Totales</p>
                    <div className="flex items-baseline gap-3 mt-2">
                      <p className="text-3xl font-bold text-gray-900">
                        {visitsData?.totalVisits || 0}
                      </p>
                      {visitsData?.totalVisits && visitsData?.previousVisits !== undefined && (
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          calculatePercentageChange(visitsData.totalVisits, visitsData.previousVisits) >= 0
                            ? 'text-green-700 bg-green-100'
                            : 'text-red-700 bg-red-100'
                        }`}>
                          {calculatePercentageChange(visitsData.totalVisits, visitsData.previousVisits) >= 0 ? '+' : ''}
                          {calculatePercentageChange(visitsData.totalVisits, visitsData.previousVisits).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      comparado con {periodOptions.find(p => p.value === selectedPeriod)?.label.toLowerCase()} anterior
                    </p>
                  </div>
                </div>
                
                {/* Gráfica de entradas */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-800">Evolución de Entradas</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      <span>Entradas por día</span>
                    </div>
                  </div>
                  
                  {visitsData?.visitsByDay && visitsData.visitsByDay.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={visitsData.visitsByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('es-ES', { 
                                month: 'short', 
                                day: 'numeric' 
                              });
                            }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={{ stroke: '#d1d5db' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            labelFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            }}
                            formatter={(value, name) => [value, 'Entradas']}
                            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#4b5563" 
                            strokeWidth={3}
                            dot={{ fill: '#4b5563', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#4b5563', strokeWidth: 2, fill: 'white' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <p className="text-lg font-medium">No hay datos suficientes</p>
                      <p className="text-sm">Selecciona un período diferente o espera a que se generen más datos</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta de Clics en Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Clics en Redes Sociales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clicksLoading || clicksByDayLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500 text-lg">Cargando datos de clics...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumen total con porcentaje */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total de Clics</p>
                  <div className="flex items-baseline gap-3 mt-2">
                    <p className="text-4xl font-bold text-gray-900">
                      {clicksByDayData?.totalClicks || 0}
                    </p>
                    {clicksByDayData?.totalClicks && clicksByDayData?.previousClicks !== undefined && (
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        calculatePercentageChange(clicksByDayData.totalClicks, clicksByDayData.previousClicks) >= 0
                          ? 'text-green-700 bg-green-100'
                          : 'text-red-700 bg-red-100'
                      }`}>
                        {calculatePercentageChange(clicksByDayData.totalClicks, clicksByDayData.previousClicks) >= 0 ? '+' : ''}
                        {calculatePercentageChange(clicksByDayData.totalClicks, clicksByDayData.previousClicks).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    comparado con {periodOptions.find(p => p.value === selectedPeriod)?.label.toLowerCase()} anterior
                  </p>
                </div>

                {/* Gráfica de clics por día */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-800">Evolución de Clics</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      <span>Clics en tiempo real</span>
                    </div>
                  </div>
                  
                  {clicksByDayLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <p className="text-lg font-medium">Cargando datos...</p>
                      <p className="text-sm">Preparando gráfica de clics</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={clicksByDayData?.clicksByDay || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('es-ES', { 
                                month: 'short', 
                                day: 'numeric' 
                              });
                            }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={{ stroke: '#d1d5db' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            labelFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            }}
                            formatter={(value, name) => [value, 'Clics']}
                            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#4b5563" 
                            strokeWidth={3}
                            dot={{ fill: '#4b5563', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: '#4b5563', strokeWidth: 2, fill: 'white' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                
                {/* Desglose por plataforma */}
                {clicksData && clicksData.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Desglose por Plataforma</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clicksData
                        .reduce((acc: any[], click: any) => {
                          const existing = acc.find(item => item.platform === click.platform);
                          if (existing) {
                            existing.count += 1;
                          } else {
                            acc.push({ platform: click.platform, count: 1 });
                          }
                          return acc;
                        }, [])
                        .sort((a: any, b: any) => b.count - a.count)
                        .map((platformData: any) => (
                          <div key={platformData.platform} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                              {platformData.platform}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                              {platformData.count}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {platformData.count === 1 ? 'clic' : 'clics'}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-medium mb-2">No hay clics registrados</p>
                    <p className="text-sm text-center max-w-md">
                      Los clics en los botones de redes sociales aparecerán aquí cuando los usuarios interactúen con ellos
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
