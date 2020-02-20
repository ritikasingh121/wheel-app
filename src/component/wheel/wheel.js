import React, { Component } from 'react'
import * as d3 from "d3";

const format = d3.format(",d");

interface Props {
        logoUrl: String,
        wheelDiameter: Number,
        wheelData: Object,
        wheelX: Number, 
        wheelY: Number
}

interface State {
        radius: String,
        innerG: any
}

class Wheel extends Component<Props, State> {    
        constructor(props: Props) {
                super(props);
                this.state = { 
                        radius: this.props.wheelDiameter/2
                };
        }

        componentDidMount() {
                this.createWheel()
        }

        componentDidUpdate(prevProps) {
                if (prevProps.wheelData !== this.props.wheelData) {
                        //Remove old wheel
                        var element = document.getElementsByTagName("g"), index;
                        for (index = element.length - 1; index >= 0; index--) {
                                element[index].parentNode.removeChild(element[index]);
                        };
                        //Create new wheel with new data
                        this.createWheel();
                }
        }

        createWheel = ()=> {
                const { radius } = this.state;
                const { clientFilter } = this.props;

                const arc = d3.arc()
                        .startAngle(d => d.x0)
                        .endAngle(d => d.x1)
                        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                        .padRadius(radius * 1.5)
                        .innerRadius(d => d.y0 * radius)
                        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));
                
                const partition = data => {
                        const root = d3.hierarchy(data)
                                .sum(d => d.size)
                                .sort((a, b) => b.value - a.value);
                        return d3.partition()
                                .size([2 * Math.PI, root.height + 1])
                                (root);
                        }
                
                const root = partition(this.props.wheelData);
                var pi = 2*Math.PI,
                start = 0;
                root.children = root.children.map((inner,index)=>{
                        inner.x0 = start;
                        inner.x1 = start+pi/root.children.length;
                        start = inner.x1;
                        let newStart = inner.x0,
                        divisor = pi/root.children.length;
                        inner.children = inner.children.map(middle=>{
                                middle.x0 = newStart;
                                middle.x1 = newStart+divisor/inner.children.length;
                                newStart = middle.x1
                                let newOuterStart = middle.x0,
                                outerDivisor = middle.x1-middle.x0;
                                middle.children = middle.children.map((outer,i)=>{
                                        console.log(newOuterStart)
                                        outer.x0 = newOuterStart;
                                        outer.x1 = newOuterStart+outerDivisor/middle.children.length;
                                        newOuterStart = outer.x1;
                                        return outer
                                })
                                return middle
                        })
                        return inner
                });
                // const color = d3.scaleOrdinal()
                
                root.each(d => d.current = d);
                
                const svg = d3.select('#partitionSVG')
                        .style("width", "100%")
                        .style("height", "auto")
                        .style("font", "5px sans-serif")
                
                const wheelContainer = document.getElementById('main_container');
                const g = svg.append("g")
                        .attr("transform", `translate(${(wheelContainer.offsetWidth * this.props.wheelX)/ 100},${(wheelContainer.offsetHeight * this.props.wheelY) / 100})`);
                
                const path = g.append("g").attr("class", "inner")
                        .selectAll("path")
                        .data(root.descendants().slice(1))
                        .join("path")
                        .attr("fill", d => {                    
                                if((d.depth === 1 || d.depth === 3) && d.data.stopLeft && d.data.stopRight){
                                        var svgDefs = svg.append('defs');

                                        var mainGradient = svgDefs.append('linearGradient')
                                            .attr('id', d.data.id);
                            
                                        // Create the stops of the main gradient. Each stop will be assigned
                                        // a class to style the stop using CSS.
                                        mainGradient.append('stop')
                                            .style('stop-color', d.data.stopLeft)
                                            .attr('offset', '0');
                            
                                        mainGradient.append('stop')
                                        //     .style('stop-color', d.data.stopRight)
                                            .style('stop-color', d.data.stopRight)
                                            .attr('offset', '1');
                                            return `url(#${d.data.id})`;
                                        // return d.data.color;                                        

                                }else{
                                        return d.data.color;                                        
                                }
                                        
                        })
                        .attr("fill-opacity", d => this.arcVisible(d.current) ? (d.children ? 1 : 1) : 1)
                        .attr("d", d => arc(d.current));
                        
                path.filter(d => d.depth > 0)
                        .style("cursor", "pointer")
                        .attr("class", d => this.setAnimation(d))
                        .on("click", this.handleLeafClick);
                
                
                
                
                path.append("title")
                        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`)
                
                
                const parent = g.append("circle")
                        .datum(root)
                        .attr("r", radius)
                        .attr("fill", "url(#image)")
                        .attr("pointer-events", "all")
                        .attr('id', 'main_logo')
                        .attr("cursor", "pointer")
                        .on("click", function () {
                                clientFilter();
                        });

                var innerG = d3.selectAll("g.inner");
                this.setState({innerG: innerG})
                const innerTextG = innerG.selectAll("g.innerText").data(root.descendants().slice(1))
                                .enter()
                                .append("g")
                                .attr("class", d => { return d.depth === 1 ? "innerText topSection" : "innerText"})
                        innerTextG.append("text").attr("dy", "0.35em")
                                .attr("fill-opacity", "1")
                                .attr("transform", d => this.labelTransform(d.current))
                                .text(d => d.data.name)
                                .style("fill", d => d.data.fontColor)
                                .style("font-size", d => d.data.fontSize)
                                .style("font-weight", d => d.data.fontWeight)
                                .style("text-anchor", d => {if(d.depth === 2 || d.depth === 3) return 'end'})
                                .style("cursor", "pointer")
                                .on("click", this.handleLeafClick);
                                
                        innerTextG.filter(d => d.depth === 1).append("image")
                                .attr("xlink:href", d => d.data.icon)
                                .attr("transform", d => this.iconTransform(d.current))
                                .attr("width", '2%')
                                .attr("height", '2%');
        }

        handleLeafClick = (d, index) => {                
                const { innerG } = this.state;
                const wheelPaths = document.getElementsByTagName('path');
                if (d.depth >= 3) {
                this.props.getAnalytics(d.data, true);
                var selectedElement = document.getElementsByClassName("itemClicked");

                        if (selectedElement.length > 0) {

                                if (wheelPaths[index].classList.contains("itemClicked")) {
                                        wheelPaths[index].classList.remove("itemClicked", "highlight");
                                        setTimeout(function () {
                                                wheelPaths[index].classList.add("highlight");
                                        }, 1000)
                                } else {
                                        selectedElement[0].classList.remove("itemClicked")
                                        wheelPaths[index].classList.add("itemClicked");
                                }

                        } else {

                                wheelPaths[index].classList.add("itemClicked");
                        }
                        // return;
                }

                // var newAngle = - ((d.x0 + d.x1) / 2);
                // innerG.transition()
                //         .duration(1500)
                //         .attr("transform", "rotate(" + (180 / Math.PI * newAngle + 90) + ")");
                //         setInterval(() => {
                //                 this.props.rotateBackground(false)
                //         }, 2000)
                /* Logic to calculate wheel rotation angle start */
                var newAngle =  ((d.x0 + d.x1) / 2);
                var aa = 180 / Math.PI * newAngle
                
                if(aa<90){
                        newAngle= Math.PI/4
                }else if(aa>90&&aa<180){
                        newAngle= -Math.PI/4
                }else if(aa>180&&aa<270){
                        newAngle= -3*Math.PI/4
                }else {
                        newAngle= -5*Math.PI/4
                }
                /* Logic to calculate wheel rotation angle end */

                /* Logic to find if wheel background will rotate or not */
                var initial = innerG.attr("transform");
                var finalAngle =  (180 / Math.PI * newAngle);
                if(finalAngle >= -225 && finalAngle<=-180){
                        finalAngle += 360;
                }
                var final = "rotate(" + finalAngle + ")";

                if(initial !== final){
                        var direction=-1;
                        var initialAngle = initial ? parseInt(initial.slice(7, initial.length-1)) : 0;
                        console.log("i : ", initialAngle, 'f : ', finalAngle);
                        if((initialAngle===45&&finalAngle===135)|| 
                        (initialAngle===-45&&finalAngle===45)||
                        (initialAngle===-135&&finalAngle===-45)||
                        (initialAngle===135&&finalAngle===-135)||
                        (initialAngle===225&&finalAngle===-45)||
                        (initialAngle===0&&finalAngle===45)||
                        (initialAngle===-135&&finalAngle===45)||
                        (initialAngle===-45&&finalAngle===135)||
                        (initialAngle===0&&finalAngle===135)){
                                
                                direction = 1
                        }
                        this.props.rotateBackground(true, direction, final);
                }

                /* Rotate wheel and stop wheel background rotation */

                setTimeout(() => {
                        if(d.depth === 1){
                                this.reArrangeTopSection(d.data.name);
                        }else if(d.depth === 2){
                                this.reArrangeTopSection(d.parent.data.name);
                        }else{
                                this.reArrangeTopSection(d.parent.parent.data.name);
                        }
                }, 600)

                innerG.transition()
                        .duration(1500)
                        .attr("transform", "rotate(" + (180 / Math.PI * newAngle) + ")");
                        setTimeout(() => {
                                this.props.stopBgRotate();
                        }, 1300)
        }

        arcVisible = (d) => {
                return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0;
        }

        labelTransform = (d) => {
                const { radius } = this.state
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 2 * radius;
                if(d.depth === 2 || d.depth === 3) return `rotate(${x - 90}) translate(${y+25},0) rotate(${0})`;
                if(d.depth === 1) return `rotate(${x - 80}) translate(${y},0) rotate(${-10})`;
        }

        reArrangeTopSection = (clickedSection) => {
                var topSections = document.getElementsByClassName('topSection');
                var topSectionName = [];
                var order;
                for(var i=0; i<topSections.length; i++){
                       topSectionName.push(topSections[i].firstElementChild.innerHTML); 
                }
                var selectIndex = topSectionName.indexOf(clickedSection);
                if(selectIndex === 0) order = ['right', 'bottom', 'left', 'top'];
                if(selectIndex === 1) order = ['top', 'right', 'bottom', 'left'];
                if(selectIndex === 2) order = ['left', 'top', 'right', 'bottom'];
                if(selectIndex === 3) order = ['bottom', 'left', 'top', 'right'];
                for(var i=0; i<topSections.length; i++){
                       var textTransformValue =  topSections[i].firstElementChild.getAttribute('transform')
                       var imageTransformValue =  topSections[i].lastElementChild.getAttribute('transform')
                       this.setTransform(textTransformValue, imageTransformValue , order[i], topSections[i]);
                }
        }

        setTransform = (textTransformValue, imageTransformValue, direction, topSection) => {
                const { radius } = this.state;
                textTransformValue = textTransformValue.split(' ');
                imageTransformValue = imageTransformValue.split(' ');
                var newTextTransformValue, newImageTransformValue;
                if(direction === 'left'){
                        newTextTransformValue = textTransformValue[0] + ` translate(${radius * 1.5},-30) rotate(170)`
                        newImageTransformValue = imageTransformValue[0] + ` translate(${radius * 1.4},-15) rotate(-10)`
                        topSection.firstElementChild.setAttribute('transform', newTextTransformValue);
                        topSection.lastElementChild.setAttribute('transform', newImageTransformValue);
                }else if(direction === 'right'){
                        newTextTransformValue = textTransformValue[0] + ` translate(${radius * 1.4},0) rotate(-10)`
                        newImageTransformValue = imageTransformValue[0] + ` translate(${radius * 1.5},-10) rotate(170)`
                        topSection.firstElementChild.setAttribute('transform', newTextTransformValue);
                        topSection.lastElementChild.setAttribute('transform', newImageTransformValue);
                }else if(direction === 'top'){
                        newTextTransformValue = textTransformValue[0] + ` translate(${radius * 1.4},-10) rotate(80)`
                        newImageTransformValue = imageTransformValue[0] + ` translate(${radius * 1.5},0) rotate(-100)`
                        topSection.firstElementChild.setAttribute('transform', newTextTransformValue);
                        topSection.lastElementChild.setAttribute('transform', newImageTransformValue);
                }else if(direction === 'bottom'){
                        newTextTransformValue = textTransformValue[0] + ` translate(${radius * 1.6},-20) rotate(-100)`
                        newImageTransformValue = imageTransformValue[0] + ` translate(${radius * 1.5},-30) rotate(80)`
                        topSection.firstElementChild.setAttribute('transform', newTextTransformValue);
                        topSection.lastElementChild.setAttribute('transform', newImageTransformValue);
                }else{
                        return;
                }

                topSection.lastElementChild.style.transition = '500ms linear all';
                topSection.firstElementChild.style.transition = '500ms linear all';
        }

        iconTransform = (d) => {
                const { radius } = this.state
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 1.7 * radius;
                return `rotate(${x - 80}) translate(${y},-10) rotate(${170})`;
        }

        setAnimation = (d) => {
                if (d.depth == 3) {
                        return "highlight";
                }
                else {
                        return ""
                }
        }


        render() {
                const { logoUrl, wheelDiameter } = this.props;
                const { radius } = this.state
                return (
                        <div>
                                { wheelDiameter && this.props.wheelX && this.props.wheelY &&
                                        // <div 
                                        //         style={{
                                        //                 width: (wheelDiameter*4+50), 
                                        //                 height:(wheelDiameter*4+50),
                                        //                 transform: `translate(-50%, -50%)`,
                                        //                 left: `${this.props.wheelX}%`,
                                        //                 top: `${this.props.wheelY}%`
                                        //         }} 
                                        //         className="wheel_background"> 
                                        //         <img src="../../backgroundImage.png" alt="BackgroundImage" className={this.props.backgroundRotate ? "rotate" : null} />
                                        // </div>
                                        <div 
                                                style={{
                                                        width: (wheelDiameter*4+50), 
                                                        height:(wheelDiameter*4+50),
                                                        transform: `translate(-50%, -50%)`,
                                                        left: `${this.props.wheelX}%`,
                                                        top: `${this.props.wheelY}%`
                                                }} 
                                                className="wheel_background"> 
                                                <img id="wheel_background" src="../../backgroundImage.png" alt="BackgroundImage"/>
                                        </div>
                                } 
                                
                                <div className="wheel">
                                        <svg id="partitionSVG" width="932" height="932">
                                        <defs>
                                                <pattern id="image" x="0" y="0" height="1" width="1">
                                                <image x="0" y="0" width={radius*2} height={radius*2} href={logoUrl}/>
                                                </pattern>
                                        </defs>
                                        </svg>
                                </div>
                        </div>   
                )
        }       
 
}

export default Wheel;

