import pyaudio
import streamlit as st
import wave
import numpy as np
import noisereduce as nr


def record_audio(filename, duration=10, rate=44100, channels=1):
    p = pyaudio.PyAudio()
    stream = p.open(
        format=pyaudio.paInt16,
        channels=channels,
        rate=rate,
        input=True,
        frames_per_buffer=1024,
    )
    frames = []
    st.write("Recording...")
    with st.spinner("Recording..."):
        for _ in range(0, int(rate / 1024 * duration)):
            data = stream.read(1024)
            frames.append(data)

    st.write("Recording complete")
    stream.stop_stream()
    stream.close()
    p.terminate()

    # Save the recording
    wf = wave.open(filename, "wb")
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(pyaudio.paInt16))
    wf.setframerate(rate)
    wf.writeframes(b"".join(frames))
    wf.close()

    # Optionally, reduce noise
    audio_data = wave.open(filename, "rb")
    samples = np.frombuffer(audio_data.readframes(-1), dtype=np.int16)
    cleaned_samples = nr.reduce_noise(y=samples, sr=rate)
    cleaned_audio = wave.open(filename.replace(".wav", "_cleaned.wav"), "wb")
    cleaned_audio.setnchannels(channels)
    cleaned_audio.setsampwidth(p.get_sample_size(pyaudio.paInt16))
    cleaned_audio.setframerate(rate)
    cleaned_audio.writeframes(cleaned_samples.tobytes())
    cleaned_audio.close()
