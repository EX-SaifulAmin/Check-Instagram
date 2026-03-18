
// function createTabel() {
//   console.log('mencet')
// }
const fileInput = document.getElementById("inputFile");
let output = document.getElementById('output');
let selectedFiles = null
fileInput.addEventListener("change", async function(){
  selectedFiles = this.files[0]
  localStorage.setItem("notFollowBack", JSON.stringify(data2))
  console.log('siap diproses')
})
async function buatTable() {
    if(!selectedFiles) return alert('Yaelah masukin filenya dulu dek')
    const zip = await JSZip.loadAsync(selectedFiles);
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
output.innerHTML = ""

dataFollowing.relationships_following.reverse().forEach((name) => {

  const exist = data1.some(item => item === name.title)

  if(!exist){

    let tr = document.createElement('tr')

    let tdNo = document.createElement('td')
    tdNo.textContent = data2.length + 1

    let tdAccount = document.createElement('td')
    tdAccount.textContent = name.title

    let tdDate = document.createElement('td')
    
    tdDate.textContent = new Date(name.string_list_data[0].timestamp * 1000).toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta', 
    hour12: false})
    
    let tdAction = document.createElement('td')
    let btn = document.createElement('button')
    btn.innerHTML = '<ion-icon id="copy" name="copy"></ion-icon>'
    btn.style.cursor = "pointer"
    tdAccount.appendChild(btn)
    btn.addEventListener("click", () => {
  navigator.clipboard.writeText(name.title)
    .then(() => {
      btn.innerHTML = "✅"
      setTimeout(()=>{
        btn.innerHTML = '<ion-icon id="copy" name="copy"></ion-icon>'
      },1500)
    })
})

    
    tr.appendChild(tdNo)
    tr.appendChild(tdAccount)
    tr.appendChild(tdDate)
    output.appendChild(tr)
    data2.push(name)
    
  }
})
      console.log(data2)
  localStorage.setItem("notFollowBack", JSON.stringify(data2))
}
window.addEventListener("load", function(){

  const saved = localStorage.getItem("notFollowBack")

  if(saved){
    const data = JSON.parse(saved)

    output.innerHTML = ""

    data.forEach((name, index) => {

      let tr = document.createElement('tr')

      let tdNo = document.createElement('td')
      tdNo.textContent = index + 1

      let tdAccount = document.createElement('td')
      tdAccount.textContent = name.title

      let tdDate = document.createElement('td')
      tdDate.textContent = new Date(
        name.string_list_data[0].timestamp * 1000
      ).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour12: false
      })

      // tombol copy juga harus dibuat ulang
      let tdAction = document.createElement('td')
      let btn = document.createElement('button')
      btn.innerHTML = '<ion-icon id="copy" name="copy"></ion-icon>'

      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(name.title)
      })
      btn.addEventListener("click", () => {
  navigator.clipboard.writeText(name.title)
    .then(() => {
      btn.innerHTML = "✅"
      setTimeout(()=>{
        btn.innerHTML = '<ion-icon id="copy"  name="copy"></ion-icon>'
      },1500)
    })
})
      tdAccount.appendChild(btn)

      tr.appendChild(tdNo)
      tr.appendChild(tdAccount)
      tr.appendChild(tdDate)
      

      output.appendChild(tr)
    })
  }

})


function tableToCSV(){
  let rows = document.querySelectorAll("table tr")
  let csv = []

  rows.forEach(row => {
    let cols = row.querySelectorAll("td, th")
    let rowData = []

    cols.forEach((col,index) => {
      if(index !==0) {
        rowData.push(col.innerText)
      }
    })

    csv.push(rowData.join(","))
  })

  download(csv.join("\n"))
}

function download(data){
  const blob = new Blob([data], { type: "text/csv" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  const now = new Date()
const fileName = `not_follow_back_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.csv`

  a.download = fileName
  a.href = url
  a.click()
}



