import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img src="/images/Logo.png" alt="App Logo" {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
    );
}
