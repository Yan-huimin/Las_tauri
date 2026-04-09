import { HOME_HISTORY_CONFIG, HOME_HISTORY_LOGO_CONFIG } from "@/hooks/home/home.config";
import ContainerItem from "../containeritem";

const HomeHistory = () => {

    // const history = useFileStore((state) => {state.historyFiles});

    return (<>
        <ContainerItem id="1" title="History" Listitems={HOME_HISTORY_CONFIG} Logoitems={HOME_HISTORY_LOGO_CONFIG}  />
    </>)
};

export default HomeHistory;