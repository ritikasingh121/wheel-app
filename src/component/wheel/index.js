import React from 'react';
import Remote from './remote';
import Analytics from './analytics';
import Wheel from './wheel';

interface Props {
    wheelData: Object,
    logoUrl: String,
    wheelDiameter: Number,
    wheelX: Number, //Always in percentage
    wheelY: Number, //Always in percentage
    defaultRemoteX: String, //Always in percentage
    defaultRemoteY: String, //Always in percentage
    filteredLeafNodeIds: Array<any>
}

interface State {
    selectedLeaf: Object,
    isAnalyticsOpen: Boolean,
    displayWheel: Boolean, 
    backgroundRotate:Boolean,
    isFiltered: Boolean, 
    isClientFilter: Boolean, 
    isShowAll: Boolean
}

class WheelContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {         
            selectedLeaf: {},
            isAnalyticsOpen: false,
            displayWheel: true, 
            backgroundRotate:false,
            wheelData: this.props.wheelData,
            logoUrl: this.props.clientLogoUrl,
            wheelDiameter: this.props.wheelD,
            wheelX: this.props.wheelX, //Always in percentage
            wheelY: this.props.wheelY, //Always in percentage
            defaultRemoteX: this.props.defaultRemoteX, //Always in percentage
            defaultRemoteY: this.props.defaultRemoteY, //Always in percentage
            filteredLeafNodeIds: [],
            isFiltered: false, 
            isClientFilter: false, 
            isShowAll: true
        };
    }

    closeWheel = (val) => {
        this.setState({displayWheel: val, isAnalyticsOpen: false, data:this.state.wheelData})
    }

    rotateBackground = (val, direction) => {
        // debugger;
        var bgAngle = document.getElementById("wheel_background").style.getPropertyValue("transform");
        var intA = bgAngle ? parseInt(bgAngle.slice(7, bgAngle.length-1)) : 1;
        var deg = intA;
        var rotation_diff = 1;
        if(val){
            this.stopBgRotate()
            var intervalInstance = setInterval(() => {
                var img = document.getElementById("wheel_background");
                // var transDeg = (direction > 0) ?  deg : -deg
                var transDeg = (direction > 0) ?  deg : deg
                // console.log("===================> ", "rotate(" + (direction < 0) ? -deg : deg + "deg)");
                img.style.webkitTransform = "rotate(" + deg + "deg)";
                img.style.transform = "rotate(" + transDeg + "deg)";
                img.style.MozTransform = "rotate(" + deg + "deg)";
                img.style.msTransform = "rotate(" + deg + "deg)";
                img.style.OTransform = "rotate(" + deg + "deg)";
                if(direction>0) deg = deg + rotation_diff;
                if(direction<0) deg = deg - rotation_diff;
            }, 20);
            
            this.setState({backgroundRotate: intervalInstance})
        }else{
            this.stopBgRotate()
        }
    }

    stopBgRotate = () =>{
        const { backgroundRotate } = this.state;
        clearInterval(backgroundRotate);
    }

    getAnalytics = (data, B) => {
        this.setState({selectedLeaf: data, isAnalyticsOpen: B})
    }

    showAll = () => {
        this.closeWheel(true);
        this.setState({wheelData: this.props.wheelData, isFiltered: false, isClientFilter: false, isShowAll: true})
    }

    clientFilter = () => {
        const { clientFilter } = this.props;
        this.setState({filteredLeafNodeIds: clientFilter}, () => {
            const wheelData = [JSON.parse(JSON.stringify(this.props.wheelData))];

            this.filterNodes(wheelData);
            this.filterNodes(wheelData);
            this.filterNodes(wheelData);
    
            this.setState({wheelData: wheelData[0], isFiltered: false, isClientFilter: true, isShowAll: false});
        })

       
    }

    defaultFiltered = () => {
        const { filtered } = this.props;
        this.setState({filteredLeafNodeIds: filtered}, ()=>{
            const wheelData = [JSON.parse(JSON.stringify(this.props.wheelData))];

            this.filterNodes(wheelData);
            this.filterNodes(wheelData);
            this.filterNodes(wheelData);
    
            this.setState({wheelData: wheelData[0], isFiltered: true, isClientFilter: false, isShowAll: false})
        })
    }

    filterNodes = (nodes) => {
        const { filteredLeafNodeIds } = this.state;
        return nodes.filter((node) => {
            if(node.children){
                if(node.children.length){
                    //reassigning in the filtered leaf nodes in the children array
                    return node.children = this.filterNodes(node.children);
                }else{
                    //this is for when a parent dont have children then it should not be appended
                    return false;
                }
            }else{
                //to append only those leaf child node whose id matched in the filteredLeafNodeIds Array
                return filteredLeafNodeIds.indexOf(parseInt(node.id)) > -1;
            }
        })
    }

    render() {
        const { wheelData, logoUrl, wheelDiameter, wheelX, wheelY, defaultRemoteY, defaultRemoteX, isFiltered, isClientFilter, isShowAll } = this.state;
        return (
            <div style={{width:'inherit', height:'inherit'}} id='main_container' className='main_container'>
                <div className="remote" style={{left: defaultRemoteX, top: defaultRemoteY}}>
                        <Remote
                            closeWheel={this.closeWheel} 
                            showAll={this.showAll}
                            clientFilter={this.clientFilter}
                            filtered={this.defaultFiltered}
                            isFiltered={isFiltered}
                            isClientFilter={isClientFilter}
                            isShowAll={isShowAll}
                        />
                </div>
                 { this.state.displayWheel && this.state.isAnalyticsOpen ? (
                        <div className="analytics">
                        <Analytics analytics={this.state.selectedLeaf} />
                </div>
                    ): null}

{this.state.displayWheel ? (
                        <div className="wheel-block">
                            {wheelData ? (
                                <Wheel 
                                    getAnalytics = {this.getAnalytics}
                                    rotateBackground={this.rotateBackground}
                                    backgroundRotate={this.state.backgroundRotate} 
                                    wheelData={wheelData} 
                                    logoUrl={logoUrl}
                                    wheelDiameter = { wheelDiameter }
                                    wheelX = { wheelX }
                                    wheelY = { wheelY }
                                    clientFilter={this.clientFilter}
                                    stopBgRotate={this.stopBgRotate}
                            />
                            ): null}
                        
                     </div>
                ): null}
            </div>
        )
    }
}

export default WheelContainer;