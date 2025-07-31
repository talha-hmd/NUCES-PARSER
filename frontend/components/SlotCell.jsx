const SlotCell = ({ data }) => {
    if (!data) return <div className="text-slate-500">—</div>;

    return (
        <div className="bg-white text-black rounded w-full h-full flex flex-col justify-center items-center px-2 py-1 overflow-hidden hover:bg-white/80 transition duration-300 cursor-none">
            <div className="text-xs font-semibold w-full text-center truncate">
                {data.Course}
            </div>
            <div className="text-[10px] text-gray-700 w-full text-center truncate">
                {data.Room}
            </div>
        </div>
    );
};

export default SlotCell;