import random
import json
from sortedcontainers import SortedList
import arrow
import pandas as pd
import cassiopeia as cass

from cassiopeia.core import Summoner, MatchHistory, Match
from cassiopeia.data import Lane
from cassiopeia import Queue, Patch, Champion
from cassiopeia.datastores.common import HTTPError

from roleidentification import get_data, get_roles

import pandas as pd

df = pd.read_csv("summoners.csv")
print(df.head())
