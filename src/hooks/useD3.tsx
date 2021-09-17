import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const useSVG = (
  render: (
    svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>
  ) => void,
  dep: unknown[]
) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    while (svgRef.current?.lastChild) {
      svgRef.current?.removeChild(svgRef.current?.lastChild);
    }
    render(d3.select(svgRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render, ...dep]);

  return svgRef;
};
