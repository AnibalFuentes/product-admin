import { CreateUpdateItem } from "./create-update-item.form";

const Items = () => {
    return ( 
        <>
        <div className="flex justify-between m-4 mb-8 ">
            <h1 className="text-2xl ml-1">Mis Productos</h1>
            <CreateUpdateItem/>
        </div>
        </>
    );
}
 
export default Items;