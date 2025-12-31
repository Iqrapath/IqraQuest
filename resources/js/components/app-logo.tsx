import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { site_name } = usePage<any>().props;

    return (
        <div className="flex items-center gap-2">
            <AppLogoIcon className="h-8 w-auto" />
            {/* <div className="flex flex-col text-left">
                <span className="truncate leading-none font-bold text-[#101928] font-['Nunito'] text-[18px]">
                    {site_name || 'IQRAQUEST'}
                </span>
            </div> */}
        </div>
    );
}
