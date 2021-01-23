# gm2m
Using phones to look at stellar models.

## Overview

## How to use
visit https://block.cs.brown.edu/gm2m/src/ to check out the app! 
If you would like to view local changes, open up a terminal and navigate to the directory this repo is stored. 
In the src folder, run `python SimpleHTTPServer 8080`. This will open the app on your local 8080 sever, and you
can open this in a web browser at localhost:8080.

## How to add new tours
- First, open the index.html file. In this file, you will find the html code that holds all of the assests that show up in the app. 
In order to add a new tour to our app, we have to add some new elements under our camera rig object.
- Once you have located the camera rig entity in the hierachy, look for the controller a-entity html element. Inside this html
element is where all of the tour information is held. 
- Now that you have found where to place a new tour, lets add one to the hierachy. Tours are a-curve objects that contain information
about where the camera rig should be. You can follow the example in the image for creating an a-curve object for a tour destination.
The key components of the a-curve object are:
```
- an id component that labels what the tour destination is named.
- a tour component that holds information about the tour itself. Check tour.js for more information about the different properties you can set. The main property to 
keep in mind is text, which will display once the destination has been reached.
- a-curve-point elements hold points of the curve that the camera rig will travel upon.
```
- The tours that you create will be traveled to in decending order, so put the ones you want the user to visit to first at the top!

## How to convert any NASA object to be compatible for this project
In order for a 3d object to appear in our app, it must be in a glb format. This format is condensed greatly, and allows for big 3d 
objects to fit and load fairly on mobile devices. Our app is a web VR program after all, so we need all the space we can get! **In order to complete this step, 
you must have blender installed on your work device. You can download the latest version of blender [here](https://www.blender.org/download/).**
1. First, visit https://chandra.si.edu/3dprint/. This website has several supernova related 3d files that we can use. Find one that you like, and download its
associated files. Once you have the files downloaded, open up Blender. 
2. In Blender, hit file->import, and select the correct import type based on the file you just downloaded.
You can check the file type by looking at the extension of the downloaded file.
The file type that you downloaded is most likely of the type stl, obj, or fbx. If the object ahs multiple files, make sure to import all of them into blender.
3. Now that you imported the object, make sure that the only things in your scene are **the object, a camera, a light.** When you open a new blender project, it
wiil always contain a camera, a light, and a blank cube. You can delete the cube from the scene by left clicking on it in the hierarchy and pressing the **X** key.
4. Now that our scene is set up, you may be wondering why our object is an unpleasant grey color. Most of the files we use don't have color associated with them
already, so we have to give them the color ourselves. Lets add some color to our object! Left click on our object, then click on the material properties of the 
object. Once this is open, we are going to want to add a new material to our object. To do so, hit the plus button in the materail properties menu, then press the 
**new** button just below it. This will add a new material to our object. Now that we have material on our object, we just need to add color. In the same menu, you 
can now add color to the material by changing the **base color**. Click on the base color and change it to something that you like. Once you've done this, you have 
added color to your object! **I highly reccommend that you do not change any other parameters of the material. A-frame reacts unpredictably to some of the 
properties you can modify, and may not render the object correctly if you enable/manipulate the other material properties.**
5. Now that your object has color. It is ready to export. Navigate to file->export, and select gLTF 2.0. Once this menu is open, select where you want to 
export the file to, and name it whatever you like. Make sure that the format being exported is **glb**, and now you have a model ready for the app!

