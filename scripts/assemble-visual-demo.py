"""Assemble sampler frames into a 15fps GIF; requires Pillow (media QA only)."""
from pathlib import Path
from PIL import Image
frames = [Image.open(p).convert('RGB') for p in sorted(Path('test-results/visual-demo-frames').glob('[0-9][0-9][0-9].png'))]
# One palette across representative states prevents frame-to-frame color flicker.
atlas = Image.new('RGB',(768,432*4))
for i,index in enumerate([0,24,46,len(frames)-1]): atlas.paste(frames[index],(0,i*432))
palette=atlas.quantize(colors=128)
images=[frame.quantize(palette=palette,dither=Image.Dither.NONE) for frame in frames]
images[0].save('assets/pibulo-activity-demo.gif',save_all=True,append_images=images[1:],duration=[70 if i%3 else 60 for i in range(len(images))],loop=0,optimize=True,disposal=1)
frames[46].save('assets/pibulo-activity-poster.png',optimize=True)
path=Path('assets/pibulo-activity-demo.gif')
with Image.open(path) as gif:
    duration=0
    for i in range(gif.n_frames):gif.seek(i);duration+=gif.info['duration']
    print({'bytes':path.stat().st_size,'frames':gif.n_frames,'duration_ms':duration,'size':gif.size})
    assert gif.n_frames>10 and 4000<=duration<=7000 and path.stat().st_size<2000000
