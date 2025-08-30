import { Card } from "@/components/ui/card";

export function ConsultationCard({ c }) {
    return (
        <Card className="p-4 space-y-1">
            <div className="text-sm text-muted-foreground">Actualizada: {new Date(c.updatedAt).toLocaleString()}</div>
            <div className="font-medium">Diagnóstico: {c.diagnosis}</div>
            <div className="text-sm">Hallazgos: {c.findings}</div>
            <div className="text-sm">Tratamiento: {c.treatment}</div>
        </Card>
    );
}