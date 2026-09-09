import { Activity, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatsCards() {
  return (
    <div className="px-4 mb-8">
      <div className="grid grid-cols-3 gap-3">
        {/* Rating Stat */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-3 backdrop-filter backdrop-blur-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="text-xl font-bold text-foreground">4.9</span>
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Calificacion
            </span>
          </CardContent>
        </Card>

        {/* Items Stat */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-3 backdrop-filter backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xl font-bold text-foreground">12</span>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Items
            </span>
          </CardContent>
        </Card>

        {/* Activity Stat */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-3 backdrop-filter backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1 text-green-500">
              <span className="text-xl font-bold text-foreground">8</span>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Actividad
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
