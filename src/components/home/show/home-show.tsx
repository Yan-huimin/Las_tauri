import { HOME_SHOW_CONFIG, HOME_SHOW_LOGO_CONFIG } from "@/hooks/home/home.config";
import ContainerItem from "../containeritem";

const HomeShow = () => {

    return (<>
        <ContainerItem id='1' title="Show" Listitems={HOME_SHOW_CONFIG} Logoitems={HOME_SHOW_LOGO_CONFIG} />
    </>);
};

export default HomeShow;