const fileInput = document.getElementById("inputFile");
fileInput.addEventListener("change", async function(){
    const file = this.files[0];
    const zip = await JSZip.loadAsync(file);
    const jsonFollowing = zip.file("connections/followers_and_following/following.json");
    const jsonFollowers = zip.file("connections/followers_and_following/followers_1.json");
    if(!jsonFollowers|| !jsonFollowing ){
        alert("JSON tidak ditemukan");
        return;
    }
    const text1 = await jsonFollowing.async("string");
    const text2 = await jsonFollowers.async("string");
    const dataFollowing = JSON.parse(text1);
    const dataFollowers = JSON.parse(text2);
    let data1 = []
    dataFollowers.forEach((name,index) => {
      data1.push(name.string_list_data[0]['value'])
    })
    console.log(data1)
    
    let data2 = []
    dataFollowing.relationships_following.forEach((name,index) => {
      const exist = data1.some(item => item === name['title'])
      if(!exist) {
        data2.push(name)
      }
    })
    console.log(data2)
});


