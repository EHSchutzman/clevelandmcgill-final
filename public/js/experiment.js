var images = new Array();

function start_experiment() {
  console.log(":");
  var experiment_div = document.getElementById("center_content");
  experiment_div.style.backgroundColor = "white";
  experiment_div.innerHTML = ` div class="card-image">
  </div>
  <div class="card-content">
    <p>
      Please enter your Prolific?
    </p>
  </div>
  <div class="card-action">
    <label for="percentage">Percentage</label>
    <input type="number" id="percentage" />
    <input onClick="answerGraph()" type="submit" value="Submit" />
  </div>`;
}

function submitDemographics() {
  console.log("SDF");
  var formId = uuidv4();
  var nameToSend = $("#name").val();
  console.log(nameToSend);
  var formData = {
    session_id: formId,
    prolific_id: nameToSend
  };
  localStorage.setItem("SessionInfo", JSON.stringify(formData));

  var http = new XMLHttpRequest();
  http.onreadystatechange = send_session_id;
  http.open("POST", "/sendSessionInfo");
  http.send(localStorage.getItem("SessionInfo"));
}

function send_session_id() {
  if (this.readyState == 4 && this.status == 200) {
    var experiment_div = document.getElementById("center_content");
    experiment_div.innerHTML = "<h1>Loading</h1>";
    setTimeout(beginExperiment, 000);
    // beginExperiment()
  }
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function beginExperiment() {
  setTimeout(function() {}, 3000);
  var http = new XMLHttpRequest();
  http.onreadystatechange = getImageNames;
  http.open("GET", "/getImageNames");
  http.send();
}

function getImageNames() {
  if (this.readyState == 4 && this.status == 200) {
    var imageNames = JSON.parse(this.responseText);
    localStorage.setItem("imageNames", JSON.stringify(imageNames));
    showTraining();
  }
}

function advanceExperiment() {
  var imageNames = JSON.parse(localStorage.getItem("imageNames"));
  if (imageNames.length == 0) {
    endExperiment();
  }
  var num = randomIntFromInterval(0, imageNames.length - 1);
  var experiment_div = document.getElementById("center_content");
  experiment_div.style.backgroundColor = "white";
  var img_time = imageNames[num].split("_")[0];

  experiment_div.innerHTML =
    `
  <div class="card-image">
    <img id="experiment_image" src="img/` +
    imageNames[num] +
    `" />
  </div>
  <div class="card-content">
    <p>
     <b> What Percentage is the smaller of the larger? </b>
    </p>
  </div>
  <div class="card-action">
    <label for="percentage">Percentage</label>
    <input type="number" id="percentage" />
    <button onclick="answerGraph()" class="btn waves-effect waves-light" type="submit" name="action">Answer
            <i class="material-icons right">send</i>
             </button>
             <br><br>
  </div>`;

  setTimeout(() => {
    document.getElementById("experiment_image").style.opacity = 0;
  }, Number(img_time));

  imageNames.splice(num, 1);
  localStorage.setItem("imageNames", JSON.stringify(imageNames));
}

function answerGraph() {
  var image = document
    .getElementById("experiment_image")
    .src.split("/")
    .pop();
  var answer = {
    image_name: image.split(".")[0],
    actual_answer: $("#percentage").val(),
    expected_answer: image.substring(0, 2),
    session_id: JSON.parse(localStorage.getItem("SessionInfo")).session_id
  };
  var http = new XMLHttpRequest();
  http.onreadystatechange = sendGraphAnswer;

  http.open("POST", "/sendAnswer");
  http.send(JSON.stringify(answer));
}

function sendGraphAnswer() {
  if (this.readyState == 4 && this.status == 200) {
    var experiment_div = document.getElementById("center_content");
    experiment_div.innerHTML = "<h3>Loading Image in 3 Seconds</h3>";
    setTimeout(advanceExperiment, 3000);
  }
}

function endExperiment() {
  var experiment_div = document.getElementById("center_content");
  experiment_div.innerHTML = `<h1>THANK YOU</h1>`;
  // window.location = "https://app.prolific.co/submissions/complete?cc=149251AA";
}
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function showTraining() {
  var experiment_div = document.getElementById("center_content");
  experiment_div.style.backgroundColor = "white";
  experiment_div.innerHTML = `<div style="text-align: center" id="title">
        <h1> What to expect in this experiment:</h1>
            </div>
            <div style="text-align: center"id="training">
                You will be shown graphs that look like the one below:
            </div> 
            <img id="experiment_image" src="/img/1000_66B.png"
            <br>
            <br>
            It will appear for either <b>.5, 1, or 3 seconds </b>  before dissapearing.
            <br>
            You will be asked to input what percentage the <b> <font color="#FFB266" >smaller (orange) </font></b> 
            marked <br>portion of the graph is than the<b> <font color="#9933FF" >larger(purple) </font></b>.
            <br><br>Click the button when you are ready to begin<br><br>
            <button onclick="showFirstGraph()" class="btn waves-effect waves-light" type="submit" name="action">Ready
            <i class="material-icons right">send</i>
             </button>
             <br><br>
            </div>`;
}

function showFirstGraph() {
  var experiment_div = document.getElementById("center_content");
  experiment_div.innerHTML = "<h3>Loading First Image in 3 Seconds</h3>";
  setTimeout(advanceExperiment, 3000);
}
