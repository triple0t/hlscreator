

// common MPEG-4 Audio definitions
// source: https://en.wikipedia.org/wiki/MPEG-4_Part_3#MPEG-4_Audio_Object_Types
const audioFormats = [
    {
        codec_name: 'aac',
        profile: 'Main',
        codec_tag_string: 'mp4a',
        full_codec: 'mp4a.40.1'
    },
    {
        codec_name: 'aac',
        profile: 'LC',
        codec_tag_string: 'mp4a',
        full_codec: 'mp4a.40.2'
    }
];

// profile_idc, constraint_set flags, level_idc
// source: https://wiki.whatwg.org/wiki/video_type_parameters
const videoFormats = [
    {
        codec_name: 'h264',
        profile: 'Constrained baseline',
        codec_tag_string: 'avc1',
        full_codec: 'avc1.42E01E'
    },
    {
        codec_name: 'h264',
        profile: 'Extended',
        codec_tag_string: 'avc1',
        full_codec: 'avc1.58A01E'
    },
    {
        codec_name: 'h264',
        profile: 'Main',
        codec_tag_string: 'avc1',
        full_codec: 'avc1.4D401E'
    },
    {
        codec_name: 'h264',
        profile: 'High',
        codec_tag_string: 'avc1',
        full_codec: 'avc1.64001E'
    }
];


const getFullCodec = (objectinfo) => {
    if (!objectinfo) return null;

    const {codec_type, profile, codec_name, codec_tag_string} = objectinfo;

    const perfromSearch = item => (item.codec_name == codec_name 
        && item.codec_tag_string == codec_tag_string && item.profile == profile)

    if (codec_type == 'video') {
        return videoFormats.find(perfromSearch).full_codec;
    } else if (codec_type == 'audio') {
        return audioFormats.find(perfromSearch).full_codec;
    }
    return null;
} 

module.exports.getFullCodec = getFullCodec;
