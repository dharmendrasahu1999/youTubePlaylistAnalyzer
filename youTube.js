const puppeteer = require("puppeteer");
const fs=require("fs");
const pdf=require("pdfkit");
// const link="https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq";
const link="https://www.youtube.com/playlist?list=PLRBp0Fe2GpglTnOLbhyrHAVaWsCIEX53Y";
let cTab;

(async function () {
    try {
        const browserOpen =  await puppeteer.launch({
            headless: false,
            args: ["--start-maximized"],
            defaultViewport: null
        })

        cTab=await browserOpen.newPage();
        // let allTabsArr=browserOpen.pages();
        // cTab=allTabsArr[0];
        await cTab.goto(link);
        await cTab.waitForSelector("h1#title")
        let name= await cTab.evaluate(function(select){return document.querySelector(select).innerText},"h1#title")
        
        let alldata= await cTab.evaluate(getData,"#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer")
        console.log(name,alldata.noOfVideos,alldata.noOfViews);

        let totalVideos=alldata.noOfVideos.split(" ")[0];
        console.log(totalVideos);

        let currentVideos= await getCVideosLength();
        console.log(currentVideos);
        //scrolling ke liye function
        while(totalVideos-currentVideos>=20){
            await scrolltoBottom()
            currentVideos= await getCVideosLength();
        }

        let finalList = await getStats()
        console.log(finalList);
        let pdfDoc=new pdf
        pdfDoc.pipe(fs.createWriteStream('play.pdf'))
        pdfDoc.text(JSON.stringify(finalList))
        pdfDoc.end()



    } catch (error) {
        console.log(error);
    }
})()


function getData(selector){
    let allElems=document.querySelectorAll(selector);
    let noOfVideos=allElems[0].innerText
    let noOfViews=allElems[1].innerText
    return {
        noOfVideos,
        noOfViews
    }
}

async function getCVideosLength(){
    let length=await cTab.evaluate(getLength,"#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer")
    return length;
}

async function scrolltoBottom(){
    await cTab.evaluate(goToBottom)
    function goToBottom(){
        window.scrollBy(0,window.innerHeight)
    }
}

async function getStats(){
    let list=cTab.evaluate(getNameAndDuration,".yt-simple-endpoint.style-scope.ytd-playlist-video-renderer","#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer")
    return list
}

function getLength(durationSelect){
    let durationElem=document.querySelectorAll(durationSelect);
    return durationElem.length;
}

function getNameAndDuration(videoSelector,durationSelector){
    let videoElem=document.querySelectorAll(videoSelector)
    let durationElem=document.querySelectorAll(durationSelector)

    let currentList=[]
    for(let i=0;i<videoElem.length;i++)
    {
        let videoTitle=videoElem[i].innerText
        let duration=durationElem[i].innerText
        currentList.push({videoTitle,duration})
    }
    return currentList;

}

// function getNameAndDuration(videoSelector,durationSelector){
//     let videoElem= Array.from(document.querySelectorAll(videoSelector))
//     let durationElem= Array.from(document.querySelectorAll(durationSelector))

//     let currentList=[]
//     for(let i=0;i<videoElem.length;i++)
//     {
//         let videoTitle=videoElem[i]
//         let duration=durationElem[i]
//         currentList.push({videoTitle,duration})
//     }
//     currentList.push({videoTitle,duration})
//     return currentList;

// }