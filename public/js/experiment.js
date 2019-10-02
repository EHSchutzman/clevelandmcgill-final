var images = new Array()

function start_experiment(){

    var experiment_div = document.getElementById('center_content')
    console.log("found experiment div")
    console.log(experiment_div)
    experiment_div.style.backgroundColor = "white"
    experiment_div.innerHTML = `<div id="title">
    <h1>Please enter your information:</h1>
        </div>
        <div id="questionnaire">
            <form action="" id="personal">
                Prolific Id: <input type="text" id="name" name="name"></br>
                Age (Optional): <input type="text" id="age" name="age"></br>
                Country: <input type="text" id="country" name="country"></br>
                Cat or Dog?
                <label for="cat">Cat</label> <input type="radio" name="animal" id="animal" value="dog">
                <label for="dog">Dog</label> <input type="radio" name="animal" id="animal" value="cat"><br>
            </form>
            <input onClick="submitDemographics()" type="submit" value="Submit">

        </div>`
    }

    function submitDemographics(){
        var formId = uuidv4();
        var nameToSend = $('#name').val();
        var ageToSend = $('#age').val();
        var genderToSend = $("input[name='gender']:checked").val();
        var countryToSend = $('#country').val();
        var animalToSend = $("input[name='animal']:checked").val();

        var formData = {
            "session_id": formId,
            "prolific_id": nameToSend,
            "age": ageToSend,
            "country": countryToSend,
            "animal": animalToSend
          }
        localStorage.setItem("SessionInfo", JSON.stringify(formData))
        console.log(formData)

        var http = new XMLHttpRequest()
        http.onreadystatechange = send_session_id
        http.open("POST", "/sendSessionInfo")
        http.send(localStorage.getItem("SessionInfo"))

    }

    function send_session_id(){
        if(this.readyState == 4 && this.status == 200 ){
            beginExperiment()
        }
    }


    function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
      }

    function beginExperiment(){
        var experiment_div = document.getElementById('center_content')
        console.log("here")
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
        var num = randomIntFromInterval(0, imageNames.length - 1)
        var experiment_div = document.getElementById('center_content')
        experiment_div.style.backgroundColor = "white"
        experiment_div.innerHTML = `<img id="experiment_image" src="`  + "/img/" + imageNames[num]+`  ">
		<div>

				What percentage is the smaller of the larger?: <input type="number" id="percentage"><br>
				<input onClick="answerGraph()" type="submit" value="Submit">

		</div>`

        imageNames.splice(num, 1)
        if(imageNames.length == 0){
            endExperiment()
        }
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
            console.log('werwe')
            advanceExperiment()
        }
    }

    function endExperiment(){
        var experiment_div = document.getElementById('center_content')
        experiment_div.innerHTML = `<h1>THANK YOU</h1>`
        window.location = "https://app.prolific.co/submissions/complete?cc=149251AA";
    }
    function randomIntFromInterval(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
