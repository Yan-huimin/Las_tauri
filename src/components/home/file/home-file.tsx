import ContainerItem from "@/components/home/containeritem";
import { HOME_FILE_CONFIG, HOME_FILE_LOGO_CONFIG } from "@/hooks/home/home.config";

const HomeFile = () => {
    return (<>
        <ContainerItem id="1" title="File" Listitems={HOME_FILE_CONFIG} Logoitems={HOME_FILE_LOGO_CONFIG}  />
    </>)
};

export default HomeFile;