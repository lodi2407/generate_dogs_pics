import { useEffect, useRef, useState } from 'react'

import './App.css'
import OpenAI from "openai";
import { Buffer } from 'buffer';


interface Dog {
  breed: string
  photo: string
}

const App = () => {
  const openai = new OpenAI({apiKey: import.meta.env.VITE_Open_AI_Key, dangerouslyAllowBrowser: true});

  const [textValue, setTextValue] = useState("");
  const [dogs, setDogs] = useState<Dog[]>([])

  const [loader, setLoader] = useState<boolean>(false)

  const [automaticDwnld, setAutomaticDwnld] = useState<boolean>()
  const linkRef = useRef<HTMLAnchorElement>(null);

  const generateImage = async () => {
    // reinitialize dogs array
    setDogs([])

    // retrieve the value of the textArea and split by the comma to get an array of dog breed
    const dogBreeds = textValue.split(',')

    for(let i = 0; i < dogBreeds.length; i++) {
      setLoader(true) 

      let dog: Dog = {breed: '', photo: ''}

      try {
        const res = await openai.images.generate({
          prompt: "A photo of a whole " + dogBreeds[i] + " dog in the grass",
          n: 1,
          size: "256x256",
          response_format: 'b64_json',
        });

        
        const blob = base64ToBlob(res.data[0].b64_json ? res.data[0].b64_json : '', 'image/jpg')
        const url = URL.createObjectURL(blob);
        
        dog.breed = dogBreeds[i]
        dog.photo = url

        setDogs(prev => [...prev, dog])

      }
      catch (error: any) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
      }
   }

   setLoader(false)
  };

  const base64ToBlob = (base64: string, contentType: string) => {
    const byteCharacters = Buffer.from(base64, 'base64')
    return new Blob([byteCharacters], { type: contentType });
  }

  const handleCheckboxOnChange = (event: any) => {
    if(event.target.checked === true) {
      setAutomaticDwnld(true)
    } else { setAutomaticDwnld(false)}
  }

  useEffect(() => {
    if (linkRef.current && automaticDwnld) linkRef.current.click()
  }, [dogs])
  
  return (
    <div>
      <h2>Generate dogs images using Open AI API</h2>
      <div className='zone'>
        <textarea
          placeholder="Search Bears with Paint Brushes the Starry Night, painted by Vincent Van Gogh.."
          onChange={(e) => setTextValue(e.target.value)}
        />
        {loader ? <div className='loader'></div> : <button className='btn' onClick={() => generateImage()} disabled={loader ? true : false}>Generate</button>}
      </div>
        <p hidden={dogs.length ? true : false}><input type="checkbox" onChange={handleCheckboxOnChange}/>Automatically download images</p>
      <div className='cards'>
        {dogs?.map((dog) => 
            (
            <div className='card' key={dog.breed}>
            <p><b>{dog.breed}</b></p>
            <img src={dog.photo} alt='photo' />
            < br/>
            <a href={dog.photo} download={dog.breed.replace(/\s+/g,'').toLowerCase() + ".jpg"} ref={linkRef} target="_blank"><button className='btn'>Download Image</button></a>
            </div>
            )
          )
        }
      </div>
    </div>
  )
}

export default App
