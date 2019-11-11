import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Button,
  View,TouchableOpacity,Animated,Image,FlatList,Alert,Linking
} from 'react-native';
import { TFLiteImageRecognition } from 'react-native-tensorflow-lite';

const Sliding_Drawer_Width = 350;


function SellersView({seller}){
    let uri=seller.name;

    return (
        <View style={styles.sellersInfo}>
     
            <Text style={{fontWeight: 'bold',fontSize:15}}>{seller.name}</Text>
            <Text style={{fontWeight: 'bold',fontSize:15,color:'green'}}>{seller.price}</Text>
            <Button
                onPress={ ()=> Linking.openURL(seller.url) }
                title="GO"
            />
            
 
        </View>
    )
}

function Item({ item }) {
    var url=item.imgUrl;

    return (
    <View style={styles.itemCard}>
        
        <Text>{item.productName}</Text>
        <Text></Text>
        <Image
          style={{width: 300, height: 200, resizeMode: 'contain'}}
          source={{uri: url}}
        />
        <Text style={styles.sellerTitle}>Market Result</Text>
        <FlatList
        data={item.sellers}
        renderItem={({ item }) => <SellersView seller={item} /> }
        //listKey={(item, index) => 'D' + index.toString()}
        keyExtractor={(item, index) => 'D' + index.toString()}
        />


        <View
        style={{
            borderBottomColor: 'orange',
            borderBottomWidth: 5,
        }}
        />
            

    </View>
  );
}

export default class App extends Component<{}> {
  constructor()
    {
        super();

        this.Animation = new Animated.Value(0);

        this.Sliding_Drawer_Toggle = true;

        this.state = {
            image_name:'',
            products:[],
        }

        try {
            // Initialize Tensorflow Lite Image Recognizer
            this.classifier = new TFLiteImageRecognition({
                // Your tflite model in assets folder.
                // Currently only non-quant files
                model: 'shoes_model.tflite',
                labels: 'labels.txt'
            })
        } catch (err) {
            alert(err)
        }

    }

    ShowSlidingDrawer = () =>
    {
        if( this.Sliding_Drawer_Toggle === true )
        {
                Animated.timing(
                    this.Animation,
                    {
                        toValue: 1,
                        duration: 500
                    }
                ).start(() =>
                {
                    this.Sliding_Drawer_Toggle = false;
                });

        }
        else
        {
                Animated.timing(
                    this.Animation,
                    {
                        toValue: 0,
                        duration: 500
                    }
                ).start(() =>
                {
                    this.Sliding_Drawer_Toggle = true;
                });
        }
    }

    async getProducts() {
        //Dont use localhost it is different for emulator and spring service
        //Use server service ip
        let text='http://217.78.102.149:8080/product/query/'.concat("",this.state.image_name);
        try {
          let response = await fetch(
              
            text,
          );
          let responseJson = await response.json();
          this.setState({ 
              products:responseJson
          })
        } catch (error) {
          console.error(error);
        }
      }


    async classifyImage(imagePath) {

        try {
            const results = await this.classifier.recognize({
                // Your image path.
                image: imagePath,
                // the input shape of your model. If none given, it will be default to 224.
                inputShape: 224
            })
            console.log("Rıfat")
            console.log(results);


            const resultObj = {
                name:  'Name: '+results[0].name ,
                confidence:  'Ratio: %'+results[0].confidence ,
                inference: 'Inference: ' + results[0].inference + 'ms2',

            }
            this.setState(resultObj)
            this.setState({
                image_name:(results[0].name).replace(new RegExp("_", 'g'),"-")
            })

            this.ShowSlidingDrawer();
            this.getProducts();
        } catch (err) {
            alert(err)
        }
    }

    componentWillUnmount() {
        // Must close the classifier when destroying or unmounting component to release object.
        this.classifier.close()
    }


     getListViewItem = (item) => {  
        Alert.alert(item.imgUrl);  
    }  



  render(){
    const Animation_Interpolate = this.Animation.interpolate(
      {
          inputRange: [ 0, 1 ],
          outputRange: [ -(Sliding_Drawer_Width - 32), 0 ]
      });

  return(
    <View style={styles.container}>



   <View style={styles.images}>
                <View>
                    
                    <Text style={styles.results}>{this.state.confidence}</Text>
                    <Text style={styles.results}>{this.state.name}</Text>
                </View>
                <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => this.classifyImage('first.jpg')}
                    >
                        <Image
                            style={styles.image}
                            source={require('./images/first.jpg')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => this.classifyImage('second.jpg')}
                    >
                        <Image
                            style={styles.image}
                            source={require('./images/second.jpg')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => this.classifyImage('whatsapp.jpg')}
                    >
                        <Image
                            style={styles.image}
                            source={require('./images/whatsapp.jpg')}
                        />
                    </TouchableOpacity>
                </View>

  

      <Animated.View style = {[ styles.Root_Sliding_Drawer_Container, { transform: [{ translateX: Animation_Interpolate }]}]}>


    <View style = { styles.Main_Sliding_Drawer_Container }>
        
        <Text style={{color:"red",fontSize: 30,}}>{this.state.image_name}</Text>
        <FlatList
        data={this.state.products.staff}
        renderItem={({ item }) => <Item  item={item}  /> }
        keyExtractor={(item, index) => 'D' + index.toString()}
        //listKey={(item, index) => 'D' + index.toString()}
        />

    </View>


    <TouchableOpacity onPress = { this.ShowSlidingDrawer}>

        <Image source={require('./images/icon.jpg')}  style = {{resizeMode: 'contain', width: 30, height: 30,left:5 }} />

      </TouchableOpacity>


    </Animated.View>

    </View>
  );
}
}

const styles = StyleSheet.create({
  container:
    {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'

    },sellersInfo:{
        justifyContent: 'space-between',
        backgroundColor: '#F5FCFF',
         alignItems: 'center',
         flexDirection: 'row',
         padding: 20,

    },sellerTitle:{
          fontSize: 25,
          padding: 5,
          textAlign: 'center',
          color: 'black'
    },
    Root_Sliding_Drawer_Container:
      {
          position: 'absolute',
          flexDirection: 'row',
          left: 0,
          top: 0,
          //top: (Platform.OS == 'ios') ? 20 : 0,
          width: Sliding_Drawer_Width,
          height:'100%'
      },

      Main_Sliding_Drawer_Container:
      {
          flex: 1,
          backgroundColor: 'white',
          paddingHorizontal: 10,
          justifyContent: 'center',
          alignItems: 'center'
      },

      TextStyle: {

          fontSize: 20,
          padding: 10,
          textAlign: 'center',
          color: 'black'
      },    
    results: {
        color:'green'
    },
    images: {
        flexDirection: 'column'
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        overflow: 'hidden'
    },
    imageMenu:{
        width:100,
        height:100,
        margin:5,
    },
    image: {
        width:150,
        height:100,
        margin:5,
    }, item: {  
        padding: 10,  
        fontSize: 18,  
        height: 44,  
    }, itemCard:{
        flex: 1,
        margin:5,
        flexDirection: 'column',

    } 
    
});