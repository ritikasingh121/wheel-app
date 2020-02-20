import React from 'react';
import Draggable from 'react-draggable';

const Remote = (props: Props) => {
    return (
        <div>
            <Draggable handle="strong" >
                <div className="box no-cursor">
                    <strong className="cursor"><div className="drag_remote">
                        <i class="fa fa-arrows" aria-hidden="true" style={{fontSize:"20px",color:"white", paddingTop: "8px"}}></i>
                    </div></strong>
                    <div>
                        <div className={props.isFiltered ? 'clickFocus remote_1' : 'remote_1'} onClick={props.filtered}>
                        <i className="fa fa-filter" aria-hidden="true" style={{fontSize:"20px",color:"white", paddingTop: "8px"}}></i>
                        </div>
                        <div className={props.isClientFilter ? 'clickFocus remote_2' : 'remote_2'} onClick={props.clientFilter} >
                        <i className="fa fa-transgender-alt" aria-hidden="true" style={{fontSize:"20px",color:"white", paddingTop: "8px"}}></i>
                        </div>
                        <div className={props.isShowAll ? 'clickFocus remote_3' : 'remote_3'} onClick={props.showAll}>
                        <i className="fa fa-snowflake-o" aria-hidden="true" style={{fontSize:"20px",color:"white", paddingTop: "8px"}}></i>
                        </div>
                        <div className="close_remote" onClick={() => props.closeWheel(false)}>
                            <i className="fa fa-close" style={{fontSize:"20px",color:"white", paddingTop: "8px"}}></i>
                        </div>
                    </div>
                </div>
            </Draggable>
        </div>
    )
};

export default Remote;