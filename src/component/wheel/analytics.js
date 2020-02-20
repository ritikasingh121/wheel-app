import React from 'react';
import ReactPlayer from 'react-player';

interface Props {
    analytics: Object
}

interface State {
    displayVideo:Boolean, 
    displayAnalytics:Boolean
}

class Analytics extends React.Component {
    constructor(props: Props) {
        super(props);
        this.state = {         
            displayVideo:false, 
            displayAnalytics:true
        };
    }

    showVideo = () => {
        this.setState({displayVideo:true, displayAnalytics:true})
    }
    
    closeVideo = () => {
        this.setState({displayVideo:false, displayAnalytics:true})
    }

    render() {
        return (
        <div className="content-box">
        {this.state.displayAnalytics ? (
              <div className="card analytics_body">
              <div className="card-body">
                  <h5 className="card-title">{this.props.analytics.name}</h5>
                  <p className="card-text">{this.props.analytics.text}</p>
                  <div className="media_content">
                  {this.props.analytics.bullets && this.props.analytics.bullets.map((item, i)=> (
                      <div className="media media_margin" key={i}>
                      <img src={item.icon} className="mr-3 media_image" alt="..."/>
                      <div className="media-body">
                      <p>{item.text}</p>
                      </div>
                  </div>
                  ))}
                  </div>
                  <button className="analytics_button" onClick={this.showVideo}> Launch Explainer Video <i class="fa fa-play" aria-hidden="true"></i> </button>
              </div>
          </div>
        ):null}
           
            {this.state.displayVideo ? (
            <div style={{display: "flex"}} className='video_section'>
            <div className="close_video" onClick={this.closeVideo}>
            <i className="fa fa-close" style={{fontSize:"20px",color:"white", paddingTop: "8px"}}></i>
            </div>
            <div>
            <ReactPlayer className="videoframe" url={this.props.analytics.video}
                    playing={true}
                    controls={true} />
            </div>
        </div>
            ): null}
            
        </div>
        )
    }
}

export default Analytics;