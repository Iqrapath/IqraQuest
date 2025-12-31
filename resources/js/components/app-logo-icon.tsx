import { SVGAttributes } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const { site_logo, site_name } = usePage<any>().props;

    return (
        <img
            src={site_logo || "/images/Logo.png"}
            alt={site_name || "App Logo"}
            className="h-10 w-auto object-contain"
            {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
    );
}
