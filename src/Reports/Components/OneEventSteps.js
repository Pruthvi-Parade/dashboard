import { Timeline, Tooltip } from 'antd';
import moment from 'moment';
import React from 'react'



export default function OneEventSteps({ event = {} }) {
    // console.log("OneEventSteps" ,    .event_id, (event.acknowledgement) ,typeof(event.reset));

    return event.event_id ? (
        <div style={{margin: '20px'}}>
            <Timeline mode="left" style={{display: 'inline-flex', minWidth: '100%'}}>
                <Timeline.Item 
                    style={{marginLeft: '40px'}}
                    dot={<span className="my-dot" style={{background: 'var(--eventStatusOpenGradient)'}}></span>}
                >
                    <div style={{marginLeft: '10px'}}>
                        <div>
                            <h2 style={{margin: '0px'}}><b>Event {event.event_id}</b></h2>
                        </div>
                        <div>
                            <span className="span-heading-width-80">Event  </span>
                            {event.event_id + " / " + event.event_code + " / " + event.event_name}
                        </div>
                        <div>
                            <span className="span-heading-width-80">Occ Time  </span>
                            {moment(event.event_occurance_time).format("MM/DD/YYYY hh:mm:ss A")}
                        </div>
                        <div>
                            <span className="span-heading-width-80">Site  </span>
                            {event.site_id + " / " + event.site_name}
                        </div>
                        <div>
                            <span className="span-heading-width-80">Location  </span>
                            {event.region_name + " / " + event.area_name}
                        </div>
                    </div>
                </Timeline.Item>

                
                {
                    event.acknowledgement && (JSON.parse(event.acknowledgement)).map(ack => (
                        <Timeline.Item
                            style={{marginLeft: '40px'}}
                            key={ack.created_time}
                            dot={<span className="my-dot" style={{background: 'var(--eventStatusACKGradient)'}}></span>}
                        >
                            <div style={{marginLeft: '10px',}}>
                                <div>
                                    <h3 style={{margin: '0px'}}><b>Acknowledge</b></h3>
                                </div>
                                <div>
                                    <span className="span-heading-width-80">By  </span>
                                    {ack.created_by} - {ack.created_by_name}
                                </div>
                                <div>
                                    <span className="span-heading-width-80">Time  </span>
                                    <Tooltip title={moment(ack.created_time).format("MM/DD/YYYY hh:mm:ss A")}>
                                        {moment(ack.created_time).fromNow()}
                                    </Tooltip>
                                </div>
                                <div>
                                    <span className="span-heading-width-80">Comment  </span>
                                    {ack.comment}
                                </div>
                            </div>
                        </Timeline.Item>
                    ))
                }
                {
                    event.reset && (JSON.parse(event.reset)).map(re => (
                        <Timeline.Item
                            style={{marginLeft: '40px'}}
                            key={re.created_time}
                            dot={<span className="my-dot" style={{background: 'black'}}></span>}
                        >
                            <div style={{marginLeft: '10px',}}>
                                <div>
                                    <h3 style={{margin: '0px'}}><b>Reset</b></h3>
                                </div>
                                <div>
                                    <span className="span-heading-width-80">By  </span>
                                    {re.created_by} - {re.created_by_name}
                                </div>
                                <div>
                                    <span className="span-heading-width-80">Time  </span>
                                    <Tooltip title={moment(re.created_time).format("MM/DD/YYYY hh:mm:ss A")}>
                                        {moment(re.created_time).fromNow()}
                                    </Tooltip>
                                </div>
                                <div>
                                    <span className="span-heading-width-80">Comment  </span>
                                    {re.comment}
                                </div>
                            </div>
                        </Timeline.Item>
                    ))
                }
            <Timeline.Item dot={<></>}></Timeline.Item>
            </Timeline>
        </div>
    ) : (
        <h3>No Event Selected</h3>
    );
}
