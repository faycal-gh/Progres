import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MenuPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">قائمة الوجبات</h1>
      
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fas fa-utensils text-4xl text-primary"></i>
            </div>
            هذه الصفحة قيد التطوير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ستتوفر قائمة الوجبات الأسبوعية قريباً
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
