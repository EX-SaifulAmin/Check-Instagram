
// DOM Elements
const fileInput = document.getElementById("inputFile");
let output = document.getElementById('output');
let delBtn = document.getElementById('Delete');
let fileMenu = document.getElementById('fileMenu');
let deleteFileBtn = document.getElementById('deleteFileBtn');
let selectedFiles = null
let currentSelectedFile = null; // Simpan file yang sedang dipilih

// Event listener untuk file input
fileInput.addEventListener("change", async function(){
  selectedFiles = this.files[0]
  console.log('siap diproses')
})

// Buat table dari file yang dipilih
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
    
    // SIMPAN KE LOCALSTORAGE DENGAN NAMA UNIK
    const fileName = selectedFiles.name || `file_${Date.now()}`;
    const fileKey = `notFollowBack_${fileName}_${Date.now()}`;
    
    // Buat object yang berisi data dan metadata
    const fileData = {
      name: fileName,
      timestamp: new Date().toLocaleString('id-ID'),
      data: data2,
      key: fileKey
    };
    
    localStorage.setItem(fileKey, JSON.stringify(fileData));
    
    // Simpan list semua file yang ada
    updateFileList();
    
    if(data2.length > 0){
      delBtn.style.display = "inline-block"
    } else {
      delBtn.style.display = "none"
    }
    
    // Reset input
    selectedFiles = null;
    fileInput.value = '';
    alert('File berhasil disimpan!');
}

// UPDATE DAFTAR FILE DI DROPDOWN
function updateFileList() {
  fileMenu.innerHTML = '<option value="">-- Pilih File --</option>';
  
  // Ambil semua key dari localStorage
  const allKeys = Object.keys(localStorage);
  const fileKeys = allKeys.filter(key => key.startsWith('notFollowBack_'));
  
  fileKeys.forEach(key => {
    const fileData = JSON.parse(localStorage.getItem(key));
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${fileData.name} (${fileData.timestamp})`;
    fileMenu.appendChild(option);
  });
}

// LOAD FILE DARI LOCALSTORAGE
function loadFileFromStorage() {
  const selectedKey = fileMenu.value;
  
  if(!selectedKey) {
    output.innerHTML = '';
    deleteFileBtn.style.display = 'none';
    currentSelectedFile = null;
    return;
  }
  
  const fileData = JSON.parse(localStorage.getItem(selectedKey));
  currentSelectedFile = selectedKey;
  
  output.innerHTML = '';
  let rowNum = 1;
  
  fileData.data.forEach((name, index) => {
    let tr = document.createElement('tr')
    let tdNo = document.createElement('td')
    tdNo.textContent = rowNum++

    let tdAccount = document.createElement('td')
    tdAccount.textContent = name.title

    let tdDate = document.createElement('td')
    tdDate.textContent = new Date(name.string_list_data[0].timestamp * 1000).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour12: false
    })

    let btn = document.createElement('button')
    btn.innerHTML = '<ion-icon id="copy" name="copy"></ion-icon>'
    btn.style.cursor = "pointer"
    
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(name.title)
        .then(() => {
          btn.innerHTML = "✅"
          setTimeout(()=>{
            btn.innerHTML = '<ion-icon id="copy" name="copy"></ion-icon>'
          },1500)
        })
    })
    
    tdAccount.appendChild(btn)
    tr.appendChild(tdNo)
    tr.appendChild(tdAccount)
    tr.appendChild(tdDate)
    output.appendChild(tr)
  })
  
  delBtn.style.display = fileData.data.length > 0 ? "inline-block" : "none"
  deleteFileBtn.style.display = 'inline-block';
}

// HAPUS FILE YANG DIPILIH
function deleteSelectedFile() {
  if(!currentSelectedFile) {
    alert('Pilih file terlebih dahulu!');
    return;
  }
  
  if(confirm('Apa anda yakin ingin menghapus file ini?')) {
    localStorage.removeItem(currentSelectedFile);
    updateFileList();
    output.innerHTML = '';
    deleteFileBtn.style.display = 'none';
    currentSelectedFile = null;
    fileMenu.value = '';
    alert('File berhasil dihapus!');
  }
}

// MUAT DATA SAAT HALAMAN PERTAMA KALI DIBUKA
window.addEventListener("load", function(){
  updateFileList();
  
  // Load file pertama secara otomatis jika ada
  const allKeys = Object.keys(localStorage);
  const fileKeys = allKeys.filter(key => key.startsWith('notFollowBack_'));
  
  if(fileKeys.length > 0) {
    fileMenu.value = fileKeys[0];
    loadFileFromStorage();
  }
})

// FUNCTION DOWNLOAD TABLE KE CSV
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

// HAPUS SEMUA TABLE DAN DATA
function Delete() {
  if(confirm('Apa anda yakin ingin menghapus SEMUA data?')) {
    // Hapus semua file dari localStorage
    const allKeys = Object.keys(localStorage);
    const fileKeys = allKeys.filter(key => key.startsWith('notFollowBack_'));
    
    fileKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    delBtn.style.display = "none"
    deleteFileBtn.style.display = "none"
    output.innerHTML = ''
    fileMenu.innerHTML = '<option value="">-- Pilih File --</option>'
    currentSelectedFile = null;
    alert('Semua data berhasil dihapus!');
  }
}