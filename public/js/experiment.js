var images = new Array()

function start_experiment(){

    var experiment_div = document.getElementById('center_content')
    experiment_div.style.backgroundColor = "white"
    experiment_div.innerHTML = `<div id="title">
    <h1>Please Enter Your Prolific Id:</h1>
        </div>
        <div id="questionnaire">
            <form action="" id="personal">
                Prolific Id: <input type="text" id="name" name="name"></br>
            </form>
            <input onClick="submitDemographics()" type="submit" value="Submit">

        </div>`
    }

    function submitDemographics(){

        var formId = uuidv4();
        var nameToSend = $('#name').val();
        var formData = {
            "session_id": formId,
            "prolific_id": nameToSend,
          }
        localStorage.setItem("SessionInfo", JSON.stringify(formData))


        var http = new XMLHttpRequest()
        http.onreadystatechange = send_session_id
        http.open("POST", "/sendSessionInfo")
        http.send(localStorage.getItem("SessionInfo"))

    }

    function send_session_id(){
        if(this.readyState == 4 && this.status == 200 ){
            var experiment_div = document.getElementById('center_content')
            experiment_div.innerHTML = "Loading image"
            setTimeout(beginExperiment, 3000)
            // beginExperiment()
        }
    }


    function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
      }

    function beginExperiment(){


        setTimeout(function(){;}, 3000)
        var http = new XMLHttpRequest()
        http.onreadystatechange = getImageNames
        http.open("GET", "/getImageNames")
        http.send()


    }
    function getImageNames(){
            if(this.readyState == 4 && this.status == 200 ){
                var imageNames = JSON.parse(this.responseText)
                localStorage.setItem("imageNames", JSON.stringify(imageNames))
                advanceExperiment()
            }
    }

    function advanceExperiment(){

        var imageNames = JSON.parse(localStorage.getItem("imageNames"))
        if(imageNames.length == 0){
            endExperiment()
        }
        var num = randomIntFromInterval(0, imageNames.length - 1)
        var experiment_div = document.getElementById('center_content')
        experiment_div.style.backgroundColor = "white"
        var img_time = imageNames[num].split("_")[0]

        experiment_div.innerHTML = `<img id="experiment_image" src="`  + "/img/" + imageNames[num]+`  ">
		<div>

				What percentage is the smaller of the larger?: <input type="number" id="percentage"><br>
				<input onClick="answerGraph()" type="submit" value="Submit">

		</div>`
        setTimeout(()=> {document.getElementById("experiment_image").style.visibility = "hidden"}, Number(img_time))

        imageNames.splice(num, 1)
        localStorage.setItem('imageNames', JSON.stringify(imageNames))

    }

    function answerGraph(){
        var image = document.getElementById("experiment_image").src.split("/").pop()
        var answer = {
            "image_name": image.split('.')[0],
            "actual_answer": $("#percentage").val(),
            "expected_answer": image.substring(0,2),
            "session_id": JSON.parse(localStorage.getItem("SessionInfo")).session_id
        }
        var http = new XMLHttpRequest()
        http.onreadystatechange = sendGraphAnswer

        http.open("POST", "/sendAnswer")
        http.send(JSON.stringify(answer))
    }

    function sendGraphAnswer(){
        if(this.readyState == 4 && this.status == 200 ){

            var experiment_div = document.getElementById('center_content')
            experiment_div.innerHTML = "Loading next image in 3 seconds"
            setTimeout(advanceExperiment, 3000)

        }
    }

    function endExperiment(){
        var experiment_div = document.getElementById('center_content')
        experiment_div.innerHTML = `<h1>THANK YOU</h1>`
        // window.location = "https://app.prolific.co/submissions/complete?cc=149251AA";
    }
    function randomIntFromInterval(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
