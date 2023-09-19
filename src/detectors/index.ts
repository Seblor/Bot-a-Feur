import BasicDetector from "./BasicDetector";
import FeurDetector from "./FeurDetector";
import PingDetector from "./PingDetector";
import QuoicoubehDetector from "./QuoicoubehDetector";
import SuffixPrefixDetector from "./SuffixPrefixDetector";
import VerbQuoiDetector from "./WithPronounDetector";

const firstDetector = new VerbQuoiDetector()


firstDetector
  .setNextDetector(new SuffixPrefixDetector())
  .setNextDetector(new BasicDetector())
  .setNextDetector(new QuoicoubehDetector())
  .setNextDetector(new FeurDetector())
  .setNextDetector(new PingDetector());

export default firstDetector;