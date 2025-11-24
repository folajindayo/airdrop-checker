import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";

interface CardLoaderProps {
    message?: string;
}

export function CardLoader({ message = "Loading..." }: CardLoaderProps) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                {message && <p className="text-sm text-muted-foreground pt-2">{message}</p>}
            </CardContent>
        </Card>
    );
}
