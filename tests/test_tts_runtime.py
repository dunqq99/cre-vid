import importlib.util
import pathlib
import tempfile
import unittest
import sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'scripts/tts'))
import setup as tts_setup

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('tts_runtime', ROOT / 'scripts/tts/runtime.py')
runtime = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runtime)

class RuntimeTest(unittest.TestCase):
    def test_materializes_cache_symlinks_inside_model_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            blob = root / 'blob'
            blob.write_bytes(b'model bytes')
            cached = root / 'cached.onnx'
            cached.symlink_to(blob)
            destination = root / 'model' / 'graph.onnx'
            tts_setup.materialize(cached, destination)
            self.assertFalse(destination.is_symlink())
            self.assertEqual(destination.resolve().parent, (root / 'model').resolve())
            self.assertEqual(destination.read_bytes(), b'model bytes')
    def test_validates_only_two_voices_and_local_output(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            request = dict(id='1', text='Xin chào Việt Nam', voiceId='male', speed=1, output=str(root / 'voice.wav'))
            self.assertEqual(runtime.validate_request(request, root)['voiceId'], 'male')
            for patch in [dict(voiceId='unknown'), dict(text=' '), dict(text='a'*3001), dict(speed=0), dict(speed=True), dict(output='/tmp/escape.wav')]:
                with self.assertRaises(ValueError):
                    runtime.validate_request({**request, **patch}, root)

    def test_manifest_rejects_incomplete_or_changed_model(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            for manifest in [{}, dict(schema=1, sdk='3.8.3', voices={'male':'Hải Đăng', 'female':'Trúc Ly'}, files=[])]:
                with self.assertRaises(ValueError):
                    runtime.validate_manifest(manifest, root)

if __name__ == '__main__':
    unittest.main()
