/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Alert
} from 'react-native';
import Camera from 'react-native-camera';
import { error } from 'util';
import axios from 'axios';
import openMap from 'react-native-open-maps';
import { Button } from 'react-native';



export default class App extends Component<{}> {

  constructor(){
    super();
    this.state = {
      sampleText : 'Test',
      latitude: '',
      longitude: ''
    };
  }
  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam)=>{
            this.camera = cam
          }}
          captureQuality={Camera.constants.CaptureQuality['480p']}
          captureTarget={Camera.constants.CaptureTarget.memory}
          playSoundOnCapture={false}
          jpegQuality={40}
          style = {styles.view}
          aspect = {Camera.constants.Aspect.fill}>
          <Text style={{color:'blue'}}>{this.state.sampleText}</Text>
          <Text
            style = {styles.capture}
            onPress = {this.takePicture.bind(this)}
          >
          [CAPTURE_IMAGE]
          </Text>
          <Button
          color={'#bdc3c7'}
          onPress={this.goToLoc.bind(this)}
          title="Click To Open Maps" />
        </Camera>
        
      </View>
    );
  }

  takePicture(){

    const options = {};

    const cloudVision = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyA_gtgnukVcMq7YxkpYtbPBu97fldIACjY";

    this.camera.capture({metadata:options}).then((data)=>{
      //console.log(data);
      // this.setState({
      //   //sampleText: data,
      //   sampleText: 'Hello World'
      // });

      axios.post(cloudVision, {
        requests: [
          {
            image: {
              content:data.data,
            },
            features: [
              {
                type: 'LOGO_DETECTION',
                maxResults: 1,
              },
              {
                type: 'LANDMARK_DETECTION',
                maxResults: 2
              }
            ],
          },
        ],
      }).then(function(response){

        const self = this;
        if(response.data.responses[0].logoAnnotations[0].description){
          this.setState({
            //sampleText: 'Hello World',
            sampleText: response.data.responses[0].logoAnnotations[0].description
          });
        }
        else{
          this.setState({
            sampleText: 'Object not found'
          });
        }

        if(response.data.responses[0].landmarkAnnotations[0].locations[0].latLng){
          this.setState({
            latitude: response.data.responses[0].landmarkAnnotations[0].locations[0].latLng.latitude,
            longitude: response.data.responses[0].landmarkAnnotations[0].locations[0].latLng.longitude
          })
        }
      
        //console.log(response.data.responses[0].textAnnotations[0].description);
        console.log(response.data.responses[0].landmarkAnnotations[0].locations[0].latLng);
        console.log(response.data.responses[0].logoAnnotations[0].description);
      }.bind(this)).catch(function(error){
        console.log(error);
      });
    }).catch(function(error){
      console.log(error);
    });

  }

  goToLoc(){
    console.log(this.state.latitude);
    console.log(this.state.longitude);
    if(this.state.latitude && this.state.longitude){
      openMap(
        { 
          latitude:this.state.latitude, 
          longitude:this.state.longitude
        }
      );
    }else{
      Alert.alert(
        'Error',
        'Location not found',
        [
          {text: 'OK', onPress:() =>console.log('Ok Pressed')}
        ],
        {cancelable: false}
      )
    }
    
  }
  // async takePicture(){

  //   const cloudVision = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyA_gtgnukVcMq7YxkpYtbPBu97fldIACjY";
  //   const options = {};

  //   try{
  //     const image64 = await this.camera.capture();

  //     const response = await axios.post(cloudVision, {
  //       requests: [
  //         {
  //           image: {
  //             content: image64.data,
  //           },
  //           features: [{
  //             type: 'TEXT_DETECTION',
  //             maxResults: 1,
  //           }],
  //         },
  //       ],
  //     });

  //     console.log(response.data.responses[0].textAnnotations);
  //   }catch(ex){

  //   }
  

   
  // }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'row'
  },
  view: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture:{
      flex:0,
      backgroundColor:'steelblue',
      borderRadius:10,
      color:'red',
      padding:15,
      margin:45
  }
});
