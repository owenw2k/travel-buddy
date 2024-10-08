import ColorModal from "./colorModal/colorModal";
import { useSelector } from "react-redux";
import { State, Legend as LegendType } from '../types'
import { useEffect, useState } from "react";

export default function Legend(){
    
    const [legends, setLegends] = useState<LegendType[]>([]);
    const reduxLegends = useSelector((state: State) => state.legends);
    useEffect(() => {
        setLegends(reduxLegends);
    }, [reduxLegends]);

    return (
        <div className={`absolute right-5 bg-white rounded-2xl p-2 m-3 legend`}>
            {legends?.map(({ color, name }: LegendType) => {
                return (
                    <div
                    key={color}
                    className="font-primary-Regular flex items-center my-1.5 gap-x-3 mr-1"
                    >
                    <div
                        className="w-4 h-4 rounded-sm"
                        style={{ background: color }}
                    />
                        <span className="text-sm">{name}</span>
                    </div>
                );
            })}
            <ColorModal/>
      </div>
    );
}