import React from "react";
import * as d3 from "d3";
import { useSVG } from "hooks/useD3";
import { ChartDataItem } from "./index";

interface TreeChartNode {
  name: string;
  children: TreeChartNode[];
}

const toTreeChartRootNode = (data: ChartDataItem[]): TreeChartNode => ({
  name: "root",
  children: data.map((item) => ({
    name: item.class,
    children: Object.entries(item.count).map(([key, value]) => ({
      name: key,
      children: [],
      value,
    })),
  })),
});

const TreeChart = ({ data }: { data: ChartDataItem[] }) => {
  const svgRef = useSVG(
    (svg) => {
      const width = 300;
      const height = 300;
      const padding = 1.5;

      console.log(toTreeChartRootNode(data));

      const root = d3
        .hierarchy<TreeChartNode>(toTreeChartRootNode(data))
        .sum((d: any) => d.value || 0);

      d3.treemap<TreeChartNode>().size([width, height]).padding(padding)(root);

      svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("x", (d: any) => d.x0)
        .attr("y", (d: any) => d.y0)
        .attr("width", (d: any) => d.x1 - d.x0)
        .attr("height", (d: any) => d.y1 - d.y0)
        .style("fill", "#69b3a2");

      svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", (d: any) => d.x0 + 10) // +10 to adjust position (more right)
        .attr("y", (d: any) => d.y0 + 20) // +20 to adjust position (lower)
        .text((d) => d.data.name)
        .attr("font-size", "15px")
        .attr("fill", "white");
    },
    [data]
  );

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "100%",
        marginRight: "10px",
        marginLeft: "10px",
      }}
    />
  );
};

export default TreeChart;
