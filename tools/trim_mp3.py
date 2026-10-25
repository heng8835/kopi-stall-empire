"""Keep only the first N seconds of an MP3 (MPEG-1/2 Layer III), cutting on a frame boundary.

No re-encoding, so the sound is untouched; the cover art (ID3 tag) is dropped. Used for the music:
the game only needs up to the loop end (src/data/music.js), so the tail is dead weight.

  .venv/Scripts/python tools/trim_mp3.py art/audio/day.mp3 public/audio/day.mp3 --seconds 113
"""
import argparse

BITRATES = {  # kbps, by (MPEG-1?, index)
    True: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    False: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
}
RATES = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def frames(data, i):
    """Yield (start, length, samples) for each MPEG audio frame from offset i."""
    while i + 4 <= len(data):
        if data[i] != 0xFF or (data[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        ver = (data[i + 1] >> 3) & 3  # 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
        br_i = data[i + 2] >> 4
        sr_i = (data[i + 2] >> 2) & 3
        if ver == 1 or br_i in (0, 15) or sr_i == 3:
            i += 1
            continue
        mpeg1 = ver == 3
        rate = RATES[ver][sr_i]
        pad = (data[i + 2] >> 1) & 1
        length = (144 if mpeg1 else 72) * BITRATES[mpeg1][br_i] * 1000 // rate + pad
        yield i, length, (1152 if mpeg1 else 576), rate
        i += length


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--seconds', type=float, required=True)
    a = ap.parse_args()
    data = open(a.src, 'rb').read()
    start = 0
    if data[:3] == b'ID3':  # skip the ID3v2 tag (cover art, title)
        start = 10 + ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9])
    t = 0.0
    end = start
    for pos, length, samples, rate in frames(data, start):
        if t >= a.seconds:
            break
        end = pos + length
        t += samples / rate
    open(a.dst, 'wb').write(data[start:end])
    print(f'{a.dst}: {t:.2f} s, {(end - start) / 1e6:.2f} MB (was {len(data) / 1e6:.2f} MB)')


if __name__ == '__main__':
    main()
