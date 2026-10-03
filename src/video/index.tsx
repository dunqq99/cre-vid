import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {NewsVideo} from './NewsVideo';import {newProject,dimensions,durationFrames,FPS} from '../lib/model';
const defaults={project:newProject(),mediaBase:''};
function Root(){return <Composition id="NewsVideo" component={NewsVideo} defaultProps={defaults} durationInFrames={630} fps={FPS} width={1080} height={1920} calculateMetadata={({props})=>({...dimensions(props.project.aspect),durationInFrames:durationFrames(props.project)})}/>;}
registerRoot(Root);
